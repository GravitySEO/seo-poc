import { generateCompletion } from '../groq-client'
import {
  getOutlinePrompt,
  getSectionPrompt,
  getPolishPrompt,
  getIntroductionPrompt,
  getConclusionPrompt,
} from '../prompts/content-generation'
import { getMetaGenerationPrompt } from '../prompts/meta-generation'
import { generateBlogImage, type GeneratedImage } from '../image-generator'
import { marked } from 'marked'
import readingTime from 'reading-time'
import slugify from 'slugify'

interface GeneratePostInput {
  title: string
  keyword: string
  secondaryKeywords: string[]
  category: string
  backlinkTargets?: Array<{ url: string; anchorText: string }>
}

interface GeneratePostOutput {
  title: string
  slug: string
  content: string
  contentHtml: string
  excerpt: string
  featuredImage: GeneratedImage | null
  meta: {
    title: string
    description: string
    ogTitle: string
    ogDescription: string
    ogImage?: string
  }
  backlinks: Array<{
    anchorText: string
    targetUrl: string
    position: string
  }>
  wordCount: number
  readingTime: number
}

const DEFAULT_BACKLINK_TARGETS = [
  { url: 'https://scoreboat.com', anchorText: 'scoreboat.com' },
  { url: 'https://scoreboat.com', anchorText: 'competitive exam preparation' },
  { url: 'https://scoreboat.com', anchorText: 'exam preparation resources' },
]

export async function generatePost(
  input: GeneratePostInput,
  onProgress?: (step: string, progress: number) => void
): Promise<GeneratePostOutput> {
  const backlinkTargets = input.backlinkTargets?.length
    ? input.backlinkTargets
    : DEFAULT_BACKLINK_TARGETS

  // Step 1: Generate outline
  onProgress?.('Generating outline...', 10)
  const outlinePrompt = getOutlinePrompt(
    input.title,
    input.keyword,
    input.secondaryKeywords,
    backlinkTargets
  )
  const outlineRaw = await generateCompletion(
    outlinePrompt.system,
    outlinePrompt.user,
    { jsonMode: true, temperature: 0.7 }
  )

  let outline: {
    outline: {
      introduction: string
      sections: Array<{
        heading: string
        subPoints: string[]
        backlinkPlacement?: { anchorText: string; targetUrl: string } | null
      }>
      conclusion: string
    }
  }

  try {
    outline = JSON.parse(outlineRaw)
  } catch {
    // Fallback outline if JSON parsing fails
    outline = {
      outline: {
        introduction: 'Introduction to the topic',
        sections: [
          { heading: 'Overview', subPoints: ['Key concepts', 'Important facts'], backlinkPlacement: null },
          { heading: 'Preparation Strategy', subPoints: ['Study plan', 'Resources'], backlinkPlacement: { anchorText: backlinkTargets[0].anchorText, targetUrl: backlinkTargets[0].url } },
          { heading: 'Important Topics', subPoints: ['Subject-wise breakdown', 'Priority areas'], backlinkPlacement: null },
          { heading: 'Tips and Tricks', subPoints: ['Time management', 'Exam day tips'], backlinkPlacement: { anchorText: backlinkTargets[1].anchorText, targetUrl: backlinkTargets[1].url } },
          { heading: 'Common Mistakes to Avoid', subPoints: ['Preparation pitfalls', 'Exam mistakes'], backlinkPlacement: null },
        ],
        conclusion: 'Summary and call to action',
      },
    }
  }

  const sections = outline.outline.sections
  const backlinksUsed: Array<{ anchorText: string; targetUrl: string; position: string }> = []

  // Step 2: Generate introduction
  onProgress?.('Writing introduction...', 20)
  const introPrompt = getIntroductionPrompt(
    input.title,
    input.keyword,
    sections.map((s) => s.heading)
  )
  const introduction = await generateCompletion(introPrompt.system, introPrompt.user, {
    temperature: 0.8,
    maxTokens: 1024,
  })

  // Step 3: Generate each section
  const sectionContents: string[] = []
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const progress = 30 + Math.floor((i / sections.length) * 40)
    onProgress?.(`Writing section ${i + 1}/${sections.length}: ${section.heading}...`, progress)

    const backlink = section.backlinkPlacement || null
    const sectionPrompt = getSectionPrompt(
      input.title,
      input.keyword,
      section.heading,
      section.subPoints,
      backlink
    )

    const sectionContent = await generateCompletion(sectionPrompt.system, sectionPrompt.user, {
      temperature: 0.75,
      maxTokens: 2048,
    })

    sectionContents.push(sectionContent)

    if (backlink) {
      backlinksUsed.push({
        anchorText: backlink.anchorText,
        targetUrl: backlink.targetUrl,
        position: i < sections.length / 2 ? 'body' : 'conclusion',
      })
    }
  }

  // Step 4: Generate conclusion
  onProgress?.('Writing conclusion...', 75)
  const conclusionPrompt = getConclusionPrompt(input.title, input.keyword)
  const conclusion = await generateCompletion(conclusionPrompt.system, conclusionPrompt.user, {
    temperature: 0.75,
    maxTokens: 1024,
  })

  // Step 5: Assemble content
  onProgress?.('Assembling and polishing...', 80)
  const rawContent = [
    `# ${input.title}\n`,
    introduction,
    ...sectionContents,
    conclusion,
  ].join('\n\n')

  // Step 6: Polish the content
  const polishPrompt = getPolishPrompt(input.title, input.keyword, rawContent)
  const polishedContent = await generateCompletion(polishPrompt.system, polishPrompt.user, {
    temperature: 0.5,
    maxTokens: 8192,
  })

  // Step 7: Generate meta tags
  onProgress?.('Generating meta tags...', 90)
  const excerpt = polishedContent.slice(0, 200).replace(/[#*\n]/g, '').trim()
  const metaPrompt = getMetaGenerationPrompt(input.title, input.keyword, excerpt)
  const metaRaw = await generateCompletion(metaPrompt.system, metaPrompt.user, {
    jsonMode: true,
    temperature: 0.5,
  })

  let meta: { metaTitle: string; metaDescription: string; ogTitle: string; ogDescription: string }
  try {
    meta = JSON.parse(metaRaw)
  } catch {
    meta = {
      metaTitle: input.title,
      metaDescription: excerpt.slice(0, 160),
      ogTitle: input.title,
      ogDescription: excerpt.slice(0, 200),
    }
  }

  // Step 8: Convert to HTML
  onProgress?.('Converting to HTML...', 92)
  const rawHtml = await marked(polishedContent)
  const stats = readingTime(polishedContent)
  const slug = slugify(input.title, { lower: true, strict: true })

  // Step 9: Fetch featured image via Pexels
  onProgress?.('Fetching featured image...', 95)
  const featuredImage = await generateBlogImage(input.title, input.keyword, input.category)

  // Prepend the featured image block to the HTML content if found
  let contentHtml = rawHtml
  if (featuredImage) {
    const creditHtml = featuredImage.credit
      ? `<figcaption style="font-size:0.75rem;color:#888;margin-top:0.4rem;">
  Photo by <a href="${featuredImage.credit.photographerUrl}" target="_blank" rel="noopener">${featuredImage.credit.photographer}</a>
  on <a href="${featuredImage.credit.pexelsUrl}" target="_blank" rel="noopener">Pexels</a>
</figcaption>`
      : ''
    const imageBlock = `<figure class="featured-image" style="margin:0 0 2rem 0;text-align:center;">
  <img
    src="${featuredImage.url}"
    alt="${featuredImage.alt}"
    style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);"
    loading="eager"
  />${creditHtml}
</figure>\n`
    contentHtml = imageBlock + rawHtml
  }

  onProgress?.('Complete!', 100)

  return {
    title: input.title,
    slug,
    content: polishedContent,
    contentHtml,
    excerpt: excerpt.slice(0, 160),
    featuredImage,
    meta: {
      title: meta.metaTitle,
      description: meta.metaDescription,
      ogTitle: meta.ogTitle,
      ogDescription: meta.ogDescription,
      ...(featuredImage ? { ogImage: featuredImage.url } : {}),
    },
    backlinks: backlinksUsed,
    wordCount: stats.words,
    readingTime: Math.ceil(stats.minutes),
  }
}

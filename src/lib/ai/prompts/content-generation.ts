export function getOutlinePrompt(
  title: string,
  keyword: string,
  secondaryKeywords: string[],
  backlinkTargets: Array<{ url: string; anchorText: string }>
): { system: string; user: string } {
  return {
    system: `You are an expert SEO content writer for scoreboat.com, India's competitive exam preparation platform. You create well-structured, comprehensive blog post outlines that are optimized for search engines and helpful for exam aspirants.

IMPORTANT: Return your response as a valid JSON object with this structure:
{
  "outline": {
    "introduction": "Brief description of the introduction",
    "sections": [
      {
        "heading": "H2 heading text",
        "subPoints": ["sub-point 1", "sub-point 2"],
        "backlinkPlacement": null or { "anchorText": "text", "targetUrl": "url" }
      }
    ],
    "conclusion": "Brief description of the conclusion"
  }
}`,
    user: `Create a detailed outline for a 1500-2000 word blog post about: "${title}"

Target keyword: "${keyword}"
Secondary keywords to include: ${secondaryKeywords.join(', ')}

The outline should have:
- An engaging introduction that hooks exam aspirants and mentions the importance of the topic
- 5-7 main sections with H2 headings
- 2-3 sub-points under each section
- A conclusion with a call-to-action directing readers to scoreboat.com

Naturally embed 2-3 backlinks to these scoreboat.com pages where relevant:
${backlinkTargets.map((b) => `- "${b.anchorText}" linking to ${b.url}`).join('\n')}

Place backlinks only where they add value contextually - never force them.`,
  }
}

export function getSectionPrompt(
  title: string,
  keyword: string,
  sectionHeading: string,
  subPoints: string[],
  backlink?: { anchorText: string; targetUrl: string } | null
): { system: string; user: string } {
  const backlinkInstruction = backlink
    ? `\n\nNaturally include a reference to scoreboat.com with anchor text "${backlink.anchorText}" linking to "${backlink.targetUrl}". Make it feel organic and helpful.`
    : ''

  return {
    system: `You are writing a section of a blog post for scoreboat.com, a competitive exam preparation website. Write in a helpful, authoritative, and encouraging tone suitable for Indian students preparing for competitive exams. Use simple, clear English that is accessible to all students. Include practical tips and actionable advice where possible.`,
    user: `Write the following section of a blog post titled "${title}":

Section heading: ${sectionHeading}
Sub-points to cover: ${subPoints.join(', ')}

Requirements:
- Write 200-350 words for this section
- Include the keyword "${keyword}" 1-2 times naturally
- Use markdown formatting (## for heading, bullet points where appropriate)
- Make it informative and practical for exam aspirants
- Do NOT include the overall blog title, just the section content starting with the ## heading${backlinkInstruction}`,
  }
}

export function getPolishPrompt(
  title: string,
  keyword: string,
  content: string
): { system: string; user: string } {
  return {
    system: `You are an SEO editor for scoreboat.com. Your job is to polish and refine blog post content to ensure it reads smoothly, is well-optimized for SEO, and maintains a consistent helpful tone for competitive exam aspirants. Do not change the structure significantly - focus on smooth transitions, consistent tone, and natural keyword integration.`,
    user: `Review and polish the following blog post titled "${title}" targeting the keyword "${keyword}".

Ensure:
1. Smooth transitions between sections
2. Keyword density of 1-2% for "${keyword}"
3. Proper markdown formatting with H2/H3 headings
4. A strong conclusion directing readers to scoreboat.com
5. Consistent helpful and encouraging tone throughout
6. Remove any redundancy or repetition

Return ONLY the polished content in markdown format. Do not add any explanations or notes.

Content to polish:
${content}`,
  }
}

export function getIntroductionPrompt(
  title: string,
  keyword: string,
  sectionHeadings: string[]
): { system: string; user: string } {
  return {
    system: `You are an expert blog writer for scoreboat.com, a competitive exam preparation platform. Write engaging introductions that hook readers and establish the value of the article.`,
    user: `Write an engaging introduction (150-200 words) for a blog post titled "${title}" targeting the keyword "${keyword}".

The post covers these main sections:
${sectionHeadings.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Requirements:
- Start with a hook that resonates with competitive exam aspirants
- Mention the target keyword naturally within the first 100 words
- Briefly preview what the reader will learn
- Use markdown formatting
- Do NOT include a heading - just the introduction paragraph(s)
- Keep the tone encouraging and helpful`,
  }
}

export function getConclusionPrompt(
  title: string,
  keyword: string
): { system: string; user: string } {
  return {
    system: `You are an expert blog writer for scoreboat.com, a competitive exam preparation platform. Write compelling conclusions that summarize key takeaways and include a call-to-action.`,
    user: `Write a conclusion (150-200 words) for a blog post titled "${title}" targeting the keyword "${keyword}".

Requirements:
- Summarize the key takeaways from the post
- Include an encouraging message for exam aspirants
- Include a call-to-action directing readers to visit scoreboat.com for more exam preparation resources
- Use the format: ## Conclusion as the heading
- Mention the keyword once naturally
- End on a motivating, positive note`,
  }
}

import { generateCompletion } from '../groq-client'
import { getMetaGenerationPrompt } from '../prompts/meta-generation'

interface MetaTags {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
}

export async function generateMeta(
  title: string,
  keyword: string,
  excerpt: string
): Promise<MetaTags> {
  const prompt = getMetaGenerationPrompt(title, keyword, excerpt)
  const result = await generateCompletion(prompt.system, prompt.user, {
    jsonMode: true,
    temperature: 0.5,
  })

  try {
    const parsed = JSON.parse(result)
    return {
      title: parsed.metaTitle || title,
      description: parsed.metaDescription || excerpt.slice(0, 160),
      ogTitle: parsed.ogTitle || title,
      ogDescription: parsed.ogDescription || excerpt.slice(0, 200),
    }
  } catch {
    return {
      title,
      description: excerpt.slice(0, 160),
      ogTitle: title,
      ogDescription: excerpt.slice(0, 200),
    }
  }
}

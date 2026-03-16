import { generateCompletion } from '../groq-client'
import { getKeywordResearchPrompt } from '../prompts/keyword-research'

interface GeneratedKeyword {
  keyword: string
  difficulty: 'low' | 'medium' | 'high'
  relatedKeywords: string[]
  suggestedTopics: string[]
}

export async function generateKeywords(category: string): Promise<GeneratedKeyword[]> {
  const prompt = getKeywordResearchPrompt(category)
  const result = await generateCompletion(prompt.system, prompt.user, {
    jsonMode: true,
    temperature: 0.8,
  })

  try {
    const parsed = JSON.parse(result)
    return parsed.keywords || []
  } catch {
    console.error('Failed to parse keyword research response')
    return []
  }
}

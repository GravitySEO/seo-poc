import { NextRequest, NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/ai/groq-client'
import { getTopicSuggestionPrompt } from '@/lib/ai/prompts/topic-suggestion'

export async function POST(request: NextRequest) {
  try {
    const { keyword, category } = await request.json()

    if (!keyword || !category) {
      return NextResponse.json(
        { error: 'Keyword and category are required' },
        { status: 400 }
      )
    }

    const prompt = getTopicSuggestionPrompt(keyword, category)
    const result = await generateCompletion(prompt.system, prompt.user, {
      jsonMode: true,
      temperature: 0.8,
    })

    try {
      const parsed = JSON.parse(result)
      return NextResponse.json({ success: true, data: parsed.topics || [] })
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse topic suggestions' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Topic suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to suggest topics' },
      { status: 500 }
    )
  }
}

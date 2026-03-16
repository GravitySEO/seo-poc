import Groq from 'groq-sdk'

let groqClient: Groq | null = null

export function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  }
  return groqClient
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxTokens?: number; jsonMode?: boolean }
): Promise<string> {
  const client = getGroqClient()
  const model = process.env.GROQ_AI_MODEL || 'llama-3.1-8b-instant'

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 4096,
    ...(options?.jsonMode ? { response_format: { type: 'json_object' } } : {}),
  })

  return completion.choices[0]?.message?.content || ''
}

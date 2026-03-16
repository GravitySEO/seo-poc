import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db/mongodb'
import { generateKeywords } from '@/lib/ai/pipelines/generate-keywords'

export async function POST(request: NextRequest) {
  try {
    const { category } = await request.json()

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }

    const keywords = await generateKeywords(category)

    if (!keywords.length) {
      return NextResponse.json({ error: 'Failed to generate keywords' }, { status: 500 })
    }

    // Save to database
    const keywordsCollection = await getCollection('keywords')
    const savedKeywords = []

    for (const kw of keywords) {
      try {
        const result = await keywordsCollection.updateOne(
          { keyword: kw.keyword },
          {
            $setOnInsert: {
              keyword: kw.keyword,
              category,
              difficulty: kw.difficulty,
              status: 'suggested',
              relatedKeywords: kw.relatedKeywords || [],
              suggestedTopics: kw.suggestedTopics || [],
              source: 'ai_generated',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        )
        savedKeywords.push({ ...kw, isNew: result.upsertedCount > 0 })
      } catch {
        // Skip duplicates
        savedKeywords.push({ ...kw, isNew: false })
      }
    }

    // Log activity
    const activityLog = await getCollection('activityLog')
    await activityLog.insertOne({
      action: 'keywords_generated',
      details: { category, count: keywords.length },
      status: 'success',
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true, data: savedKeywords })
  } catch (error) {
    console.error('Keyword suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate keywords' },
      { status: 500 }
    )
  }
}

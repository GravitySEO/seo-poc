import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const keywords = await getCollection('keywords')

    const filter: Record<string, unknown> = {}
    if (category) filter.category = category
    if (status) filter.status = status

    const total = await keywords.countDocuments(filter)
    const items = await keywords
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      success: true,
      data: items,
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error('Keywords list error:', error)
    return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const keywords = await getCollection('keywords')

    const keyword = {
      keyword: body.keyword,
      category: body.category,
      difficulty: body.difficulty || 'medium',
      status: 'approved',
      relatedKeywords: body.relatedKeywords || [],
      suggestedTopics: body.suggestedTopics || [],
      source: 'manual',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await keywords.insertOne(keyword)
    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...keyword },
    })
  } catch (error) {
    console.error('Create keyword error:', error)
    return NextResponse.json({ error: 'Failed to create keyword' }, { status: 500 })
  }
}

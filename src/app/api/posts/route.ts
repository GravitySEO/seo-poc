import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const posts = await getCollection('posts')

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status
    if (category) filter.category = category
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { targetKeyword: { $regex: search, $options: 'i' } },
      ]
    }

    const total = await posts.countDocuments(filter)
    const items = await posts
      .find(filter)
      .project({
        title: 1,
        slug: 1,
        category: 1,
        status: 1,
        targetKeyword: 1,
        wordCount: 1,
        platformResults: 1,
        createdAt: 1,
        updatedAt: 1,
      })
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
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Posts list error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const posts = await getCollection('posts')

    const post = {
      title: body.title,
      slug: body.slug,
      content: body.content || '',
      contentHtml: body.contentHtml || '',
      excerpt: body.excerpt || '',
      targetKeyword: body.targetKeyword || '',
      secondaryKeywords: body.secondaryKeywords || [],
      meta: body.meta || { title: '', description: '', ogTitle: '', ogDescription: '' },
      category: body.category || '',
      tags: body.tags || [],
      backlinks: body.backlinks || [],
      status: 'draft',
      platformResults: [],
      socialResults: [],
      aiModel: '',
      wordCount: body.wordCount || 0,
      readingTime: body.readingTime || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await posts.insertOne(post)
    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...post },
    })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db/mongodb'
import { generatePost } from '@/lib/ai/pipelines/generate-post'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, keyword, secondaryKeywords = [], category, backlinkTargets } = body

    if (!title || !keyword || !category) {
      return NextResponse.json(
        { error: 'Title, keyword, and category are required' },
        { status: 400 }
      )
    }

    const result = await generatePost({
      title,
      keyword,
      secondaryKeywords,
      category,
      backlinkTargets,
    })

    // Save to database
    const posts = await getCollection('posts')

    // Check for duplicate slug
    const existing = await posts.findOne({ slug: result.slug })
    if (existing) {
      result.slug = `${result.slug}-${Date.now()}`
    }

    const post = {
      ...result,
      targetKeyword: keyword,
      secondaryKeywords,
      category,
      tags: [category.toLowerCase(), ...secondaryKeywords.slice(0, 3)],
      status: 'draft',
      platformResults: [],
      socialResults: [],
      aiModel: process.env.GROQ_AI_MODEL || 'llama-3.1-8b-instant',
      generationPrompt: `Title: ${title}, Keyword: ${keyword}`,
      // featuredImage is already in result; ensure ogImage is set in meta
      meta: {
        ...result.meta,
        ogImage: result.featuredImage?.url ?? result.meta.ogImage,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const insertResult = await posts.insertOne(post)

    // Log activity
    const activityLog = await getCollection('activityLog')
    await activityLog.insertOne({
      action: 'content_generated',
      postId: insertResult.insertedId,
      details: { title, keyword, category, wordCount: result.wordCount },
      status: 'success',
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      data: { _id: insertResult.insertedId, ...result },
    })
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    )
  }
}

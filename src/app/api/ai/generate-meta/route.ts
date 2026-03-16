import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/db/mongodb'
import { generateMeta } from '@/lib/ai/pipelines/generate-meta'

export async function POST(request: NextRequest) {
  try {
    const { postId, title, keyword, excerpt } = await request.json()

    if (!title || !keyword) {
      return NextResponse.json(
        { error: 'Title and keyword are required' },
        { status: 400 }
      )
    }

    const meta = await generateMeta(title, keyword, excerpt || '')

    // Update post if postId provided
    if (postId) {
      const posts = await getCollection('posts')
      await posts.updateOne(
        { _id: new ObjectId(postId) },
        {
          $set: {
            meta: {
              title: meta.title,
              description: meta.description,
              ogTitle: meta.ogTitle,
              ogDescription: meta.ogDescription,
            },
            updatedAt: new Date(),
          },
        }
      )
    }

    return NextResponse.json({ success: true, data: meta })
  } catch (error) {
    console.error('Meta generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate meta tags' },
      { status: 500 }
    )
  }
}

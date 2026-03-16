import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/db/mongodb'

export async function GET() {
  try {
    const posts = await getCollection('posts')
    const keywords = await getCollection('keywords')
    const backlinks = await getCollection('backlinks')

    const [totalPosts, publishedPosts, totalKeywords, activeBacklinks, recentPosts] =
      await Promise.all([
        posts.countDocuments(),
        posts.countDocuments({ status: 'published' }),
        keywords.countDocuments(),
        backlinks.countDocuments({ status: 'active' }),
        posts
          .find()
          .project({ title: 1, status: 1, createdAt: 1, category: 1 })
          .sort({ createdAt: -1 })
          .limit(5)
          .toArray(),
      ])

    return NextResponse.json({
      success: true,
      data: {
        totalPosts,
        publishedPosts,
        totalKeywords,
        activeBacklinks,
        recentPosts,
      },
    })
  } catch (error) {
    console.error('Analytics overview error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

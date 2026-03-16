import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/db/mongodb'
import { getSocialAdapter } from '@/lib/social/social-manager'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { platforms, customText } = await request.json()
    const posts = await getCollection('posts')
    const post = await posts.findOne({ _id: new ObjectId(params.id) })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const platformConfigs = await getCollection('platformConfigs')
    const activityLog = await getCollection('activityLog')
    const results: Array<{ platform: string; status: string; postedUrl?: string; error?: string }> = []

    // Determine the best URL to share
    const publishedUrl = post.platformResults?.find(
      (pr: { status: string; publishedUrl?: string }) => pr.status === 'published' && pr.publishedUrl
    )?.publishedUrl || `${process.env.SCOREBOAT_BASE_URL}/${post.slug}`

    const shareText = customText || `${post.title} - Check out this helpful guide for competitive exam preparation!`

    for (const platformName of platforms) {
      const adapter = getSocialAdapter(platformName)
      if (!adapter) {
        results.push({ platform: platformName, status: 'failed', error: 'Unknown platform' })
        continue
      }

      // Read credentials from MongoDB platformConfigs
      const config = await platformConfigs.findOne({ platform: platformName, enabled: true })

      if (!config) {
        results.push({ platform: platformName, status: 'failed', error: `${platformName} is not configured or disabled. Go to Platforms settings to set it up.` })
        continue
      }

      const credentials = (config.credentials || {}) as Record<string, string>

      // Check if credentials are present
      const hasAnyCredential = Object.values(credentials).some((v) => !!v)
      if (!hasAnyCredential) {
        results.push({ platform: platformName, status: 'failed', error: `No credentials configured for ${platformName}. Go to Platforms settings.` })
        continue
      }

      try {
        const result = await adapter.share(
          { text: shareText, url: publishedUrl, tags: post.tags },
          credentials
        )

        results.push({
          platform: platformName,
          status: result.success ? 'posted' : 'failed',
          postedUrl: result.postedUrl,
          error: result.error,
        })

        await activityLog.insertOne({
          action: `shared_on_${platformName}`,
          postId: new ObjectId(params.id),
          platform: platformName,
          details: { url: publishedUrl, text: shareText.slice(0, 100) },
          status: result.success ? 'success' : 'failure',
          error: result.error,
          timestamp: new Date(),
        })
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error'
        results.push({ platform: platformName, status: 'failed', error })
      }
    }

    // Update post social results
    await posts.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $push: { socialResults: { $each: results } } as any,
        $set: { updatedAt: new Date() },
      }
    )

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error('Share error:', error)
    return NextResponse.json({ error: 'Failed to share' }, { status: 500 })
  }
}

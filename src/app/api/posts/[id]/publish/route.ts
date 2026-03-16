import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection } from '@/lib/db/mongodb'
import { PlatformConfig } from '@/types/platform'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { platforms } = await request.json()
    const posts = await getCollection('posts')
    const post = await posts.findOne({ _id: new ObjectId(params.id) })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const platformConfigs = await getCollection('platformConfigs')
    const activityLog = await getCollection('activityLog')
    const backlinksCollection = await getCollection('backlinks')
    const results: Array<{ platform: string; status: string; publishedUrl?: string; error?: string }> = []

    // Build a shared publish request so all platforms get the image URL
    const imageUrl = post.meta?.ogImage || post.featuredImage?.url || ''
    const baseRequest = {
      title: post.title,
      content: post.contentHtml,
      contentMarkdown: post.content,
      tags: post.tags,
      canonicalUrl: `${process.env.SCOREBOAT_BASE_URL}/${post.slug}`,
      meta: {
        description: post.meta?.description || '',
        ogImage: imageUrl,
      },
    }

    for (const platformName of platforms) {
      const config = await platformConfigs.findOne({ platform: platformName, enabled: true }) as unknown as PlatformConfig | null

      if (!config) {
        results.push({ platform: platformName, status: 'failed', error: 'Platform not configured or disabled' })
        continue
      }

      try {
        let publishResult: { success: boolean; publishedUrl?: string; externalId?: string; error?: string }

        // Dynamic import of platform adapter
        switch (platformName) {
          case 'devto': {
            const { DevToPublisher } = await import('@/lib/publishers/adapters/devto')
            const publisher = new DevToPublisher()
            publishResult = await publisher.publish(baseRequest, config)
            break
          }
          case 'medium': {
            const { MediumPublisher } = await import('@/lib/publishers/adapters/medium')
            const publisher = new MediumPublisher()
            publishResult = await publisher.publish(baseRequest, config)
            break
          }
          case 'hashnode': {
            const { HashnodePublisher } = await import('@/lib/publishers/adapters/hashnode')
            const publisher = new HashnodePublisher()
            publishResult = await publisher.publish(baseRequest, config)
            break
          }
          case 'wordpress': {
            const { WordPressPublisher } = await import('@/lib/publishers/adapters/wordpress')
            const publisher = new WordPressPublisher()
            publishResult = await publisher.publish(baseRequest, config)
            break
          }
          case 'blogger': {
            const { BloggerPublisher } = await import('@/lib/publishers/adapters/blogger')
            const publisher = new BloggerPublisher()
            publishResult = await publisher.publish(baseRequest, config)
            break
          }
          default:
            publishResult = { success: false, error: `Unknown platform: ${platformName}` }
        }

        const platformResult = {
          platform: platformName,
          status: publishResult.success ? 'published' : 'failed',
          publishedUrl: publishResult.publishedUrl,
          publishedAt: publishResult.success ? new Date() : undefined,
          externalId: publishResult.externalId,
          error: publishResult.error,
        }

        results.push(platformResult)

        // Create backlink records on success
        if (publishResult.success && publishResult.publishedUrl) {
          for (const bl of (post.backlinks || [])) {
            await backlinksCollection.insertOne({
              postId: new ObjectId(params.id),
              platform: platformName,
              publishedUrl: publishResult.publishedUrl,
              targetUrl: bl.targetUrl,
              anchorText: bl.anchorText,
              status: 'active',
              createdAt: new Date(),
            })
          }
        }

        await activityLog.insertOne({
          action: `published_to_${platformName}`,
          postId: new ObjectId(params.id),
          platform: platformName,
          details: platformResult,
          status: publishResult.success ? 'success' : 'failure',
          error: publishResult.error,
          timestamp: new Date(),
        })
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Unknown error'
        results.push({ platform: platformName, status: 'failed', error })
      }
    }

    // Update post with platform results
    const allPublished = results.every(r => r.status === 'published')
    const anyPublished = results.some(r => r.status === 'published')

    await posts.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status: allPublished ? 'published' : anyPublished ? 'publishing' : 'failed',
          publishedAt: anyPublished ? new Date() : undefined,
          updatedAt: new Date(),
        },
        $push: {
          platformResults: { $each: results },
        } as any,
      }
    )

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json({ error: 'Failed to publish' }, { status: 500 })
  }
}

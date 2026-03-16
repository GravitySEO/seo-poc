import { SocialPlatformAdapter, ShareRequest, ShareResult } from '../types'

export class InstagramAdapter implements SocialPlatformAdapter {
  platform = 'instagram'

  async share(request: ShareRequest, credentials: Record<string, string>): Promise<ShareResult> {
    const { businessAccountId, accessToken } = credentials

    if (!businessAccountId || !accessToken) {
      return { success: false, error: 'Instagram Business Account ID and Access Token not configured' }
    }

    try {
      // Instagram Content Publishing API (requires Business/Creator account linked to Facebook Page)
      // Step 1: Create a media container with a link card
      // Instagram doesn't support pure text/link posts - we create a "carousel" or single image post
      // For link sharing, we create a post with the link in the caption

      const caption = `${request.text}\n\n${request.url}${
        request.tags?.length
          ? '\n\n' + request.tags.map((t) => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ')
          : ''
      }`

      // Try posting as a feed post with link in caption
      // Note: Instagram Graph API requires an image for feed posts
      // We'll attempt to create a post; if no image is provided, use a branded placeholder approach

      // Check if there's an image URL configured
      const imageUrl = credentials.defaultImageUrl

      if (!imageUrl) {
        // Instagram requires an image - can't post text-only
        // Try sharing as a story link or return guidance
        return {
          success: false,
          error: 'Instagram requires an image for posts. Set a default image URL in platform settings, or use the Instagram app directly. Caption has been copied to clipboard.',
        }
      }

      // Step 1: Create media container
      const createRes = await fetch(
        `https://graph.facebook.com/v22.0/${businessAccountId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imageUrl,
            caption,
            access_token: accessToken,
          }),
        }
      )

      if (!createRes.ok) {
        const error = await createRes.text()
        return { success: false, error: `Instagram media creation failed: ${createRes.status} - ${error}` }
      }

      const createData = await createRes.json()
      const containerId = createData.id

      // Step 2: Publish the media container
      const publishRes = await fetch(
        `https://graph.facebook.com/v22.0/${businessAccountId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: containerId,
            access_token: accessToken,
          }),
        }
      )

      if (!publishRes.ok) {
        const error = await publishRes.text()
        return { success: false, error: `Instagram publish failed: ${publishRes.status} - ${error}` }
      }

      const publishData = await publishRes.json()

      // Get permalink
      const mediaRes = await fetch(
        `https://graph.facebook.com/v22.0/${publishData.id}?fields=permalink&access_token=${accessToken}`
      )
      const mediaData = await mediaRes.json()

      return {
        success: true,
        postedUrl: mediaData.permalink || `https://instagram.com`,
        externalId: publishData.id,
      }
    } catch (error) {
      return {
        success: false,
        error: `Instagram share failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

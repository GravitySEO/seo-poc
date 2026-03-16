import { PlatformPublisher, PublishRequest, PublishResult, PlatformConfig } from '../types'

/**
 * Downloads an external image and uploads it to the WordPress.com Media Library.
 * Returns the media attachment ID, or null if upload fails.
 */
async function uploadImageToWordPress(
  imageUrl: string,
  token: string,
  siteId: string,
  title: string
): Promise<number | null> {
  try {
    // Download the image
    const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) })
    if (!imgRes.ok) return null

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
    const buffer = await imgRes.arrayBuffer()
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
    const filename = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 50)}.${ext}`

    // Upload to WordPress media library
    const uploadRes = await fetch(
      `https://public-api.wordpress.com/wp/v2/sites/${siteId}/media`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
        body: buffer,
      }
    )

    if (!uploadRes.ok) {
      console.warn('[WP] Media upload failed:', uploadRes.status, await uploadRes.text())
      return null
    }

    const media = await uploadRes.json()
    console.log('[WP] Uploaded media id:', media.id)
    return media.id ?? null
  } catch (err) {
    console.warn('[WP] Image upload error:', err)
    return null
  }
}

export class WordPressPublisher implements PlatformPublisher {
  platform = 'wordpress'

  async publish(request: PublishRequest, config: PlatformConfig): Promise<PublishResult> {
    const token = config.credentials.accessToken
    const siteId = config.credentials.siteId

    if (!token || !siteId) {
      return { success: false, error: 'WordPress.com token or site ID not configured' }
    }

    try {
      const contentWithFooter = `${request.content}<hr><p><em>Originally published on <a href="${request.canonicalUrl || 'https://scoreboat.com'}">scoreboat.com</a>. Visit us for more competitive exam preparation resources.</em></p>`

      // Upload featured image to WordPress media library if available
      const imageUrl = request.meta.ogImage
      let featuredMediaId: number | null = null
      if (imageUrl) {
        featuredMediaId = await uploadImageToWordPress(imageUrl, token, siteId, request.title)
      }

      const postBody: Record<string, unknown> = {
        title: request.title,
        content: contentWithFooter,
        status: config.settings.publishAs === 'draft' ? 'draft' : 'publish',
        excerpt: request.meta.description,
        tags: request.tags,
      }

      // Set WordPress featured image (thumbnail) if upload succeeded
      if (featuredMediaId) {
        postBody.featured_media = featuredMediaId
      }

      const res = await fetch(
        `https://public-api.wordpress.com/wp/v2/sites/${siteId}/posts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(postBody),
        }
      )

      if (!res.ok) {
        const error = await res.text()
        return { success: false, error: `WordPress API error: ${res.status} - ${error}` }
      }

      const data = await res.json()
      return {
        success: true,
        publishedUrl: data.link,
        externalId: String(data.id),
      }
    } catch (error) {
      return {
        success: false,
        error: `WordPress publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

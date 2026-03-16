import { PlatformPublisher, PublishRequest, PublishResult, PlatformConfig } from '../types'

export class MediumPublisher implements PlatformPublisher {
  platform = 'medium'

  async publish(request: PublishRequest, config: PlatformConfig): Promise<PublishResult> {
    const token = config.credentials.accessToken
    if (!token) {
      return { success: false, error: 'Medium integration token not configured' }
    }

    try {
      // First, get the user ID
      let userId = config.credentials.userId
      if (!userId) {
        const meRes = await fetch('https://api.medium.com/v1/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!meRes.ok) {
          return { success: false, error: 'Failed to get Medium user. Check your token.' }
        }
        const meData = await meRes.json()
        userId = meData.data.id
      }

      // Prepend a plain <img> at the top for Medium (Medium strips <figure> and inline styles,
      // but renders <img> tags correctly inside <p> or standalone)
      const imageUrl = request.meta.ogImage
      const imageHtml = imageUrl
        ? `<p><img src="${imageUrl}" alt="${request.title}" /></p>`
        : ''

      // Add footer with backlink
      const contentWithFooter = `${imageHtml}${request.content}<hr><p><em>Originally published on <a href="${request.canonicalUrl || 'https://scoreboat.com'}">scoreboat.com</a>. Visit us for more competitive exam preparation resources.</em></p>`

      const res = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: request.title,
          contentFormat: 'html',
          content: contentWithFooter,
          tags: request.tags.slice(0, 5),
          canonicalUrl: request.canonicalUrl,
          publishStatus: config.settings.publishAs === 'draft' ? 'draft' : 'public',
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        return { success: false, error: `Medium API error: ${res.status} - ${error}` }
      }

      const data = await res.json()
      return {
        success: true,
        publishedUrl: data.data.url,
        externalId: data.data.id,
      }
    } catch (error) {
      return {
        success: false,
        error: `Medium publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

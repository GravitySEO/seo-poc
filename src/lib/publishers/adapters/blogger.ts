import { PlatformPublisher, PublishRequest, PublishResult, PlatformConfig } from '../types'

export class BloggerPublisher implements PlatformPublisher {
  platform = 'blogger'

  async publish(request: PublishRequest, config: PlatformConfig): Promise<PublishResult> {
    const apiKey = config.credentials.apiKey
    const blogId = config.credentials.blogId
    const accessToken = config.credentials.accessToken

    if (!blogId || (!apiKey && !accessToken)) {
      return { success: false, error: 'Blogger blog ID and API key/token not configured' }
    }

    try {
      // Prepend featured image — Blogger renders HTML as-is so a plain img tag works best
      const imageUrl = request.meta.ogImage
      const imageHtml = imageUrl
        ? `<div style="text-align:center;margin-bottom:1.5em;"><img src="${imageUrl}" alt="${request.title}" style="max-width:100%;height:auto;border-radius:6px;" /></div>`
        : ''

      const contentWithFooter = `${imageHtml}${request.content}<hr><p><em>Originally published on <a href="${request.canonicalUrl || 'https://scoreboat.com'}">scoreboat.com</a>. Visit us for more competitive exam preparation resources.</em></p>`

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      let url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`
      } else if (apiKey) {
        url += `?key=${apiKey}`
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          kind: 'blogger#post',
          title: request.title,
          content: contentWithFooter,
          labels: request.tags,
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        return { success: false, error: `Blogger API error: ${res.status} - ${error}` }
      }

      const data = await res.json()
      return {
        success: true,
        publishedUrl: data.url,
        externalId: data.id,
      }
    } catch (error) {
      return {
        success: false,
        error: `Blogger publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

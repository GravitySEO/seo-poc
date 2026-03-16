import { PlatformPublisher, PublishRequest, PublishResult, PlatformConfig } from '../types'

export class DevToPublisher implements PlatformPublisher {
  platform = 'devto'

  async publish(request: PublishRequest, config: PlatformConfig): Promise<PublishResult> {
    const apiKey = config.credentials.apiKey
    if (!apiKey) {
      return { success: false, error: 'Dev.to API key not configured' }
    }

    try {
      // Prepend featured image to markdown if available (Dev.to renders markdown images)
      const imageUrl = request.meta.ogImage
      const imageMarkdown = imageUrl
        ? `![${request.title}](${imageUrl})\n\n`
        : ''

      // Add footer with backlink
      const contentWithFooter = `${imageMarkdown}${request.contentMarkdown}\n\n---\n*Originally published on [scoreboat.com](${request.canonicalUrl || 'https://scoreboat.com'}). Visit us for more competitive exam preparation resources.*`

      const articlePayload: Record<string, unknown> = {
        title: request.title,
        body_markdown: contentWithFooter,
        published: config.settings.publishAs !== 'draft',
        tags: request.tags.slice(0, 4).map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, '')),
        canonical_url: request.canonicalUrl,
        description: request.meta.description,
      }

      // Set cover image if available
      if (imageUrl) {
        articlePayload.cover_image = imageUrl
        articlePayload.main_image = imageUrl
      }

      const res = await fetch('https://dev.to/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({ article: articlePayload }),
      })

      if (!res.ok) {
        const error = await res.text()
        return { success: false, error: `Dev.to API error: ${res.status} - ${error}` }
      }

      const data = await res.json()
      return {
        success: true,
        publishedUrl: data.url,
        externalId: String(data.id),
      }
    } catch (error) {
      return {
        success: false,
        error: `Dev.to publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

import { PlatformPublisher, PublishRequest, PublishResult, PlatformConfig } from '../types'

export class HashnodePublisher implements PlatformPublisher {
  platform = 'hashnode'

  async publish(request: PublishRequest, config: PlatformConfig): Promise<PublishResult> {
    const token = config.credentials.accessToken
    const publicationId = config.credentials.publicationId

    if (!token || !publicationId) {
      return { success: false, error: 'Hashnode token or publication ID not configured' }
    }

    try {
      // Prepend featured image to markdown if available
      const imageUrl = request.meta.ogImage
      const imageMarkdown = imageUrl
        ? `![${request.title}](${imageUrl})\n\n`
        : ''

      const contentWithFooter = `${imageMarkdown}${request.contentMarkdown}\n\n---\n*Originally published on [scoreboat.com](${request.canonicalUrl || 'https://scoreboat.com'}). Visit us for more competitive exam preparation resources.*`

      const mutation = `
        mutation PublishPost($input: PublishPostInput!) {
          publishPost(input: $input) {
            post {
              id
              url
              title
            }
          }
        }
      `

      // Build input, including cover image if available
      const postInput: Record<string, unknown> = {
        title: request.title,
        contentMarkdown: contentWithFooter,
        publicationId,
        tags: request.tags.slice(0, 5).map((t) => ({ name: t, slug: t.toLowerCase().replace(/\s+/g, '-') })),
        originalArticleURL: request.canonicalUrl,
        subtitle: request.meta.description,
      }
      if (imageUrl) {
        postInput.coverImageOptions = { coverImageURL: imageUrl }
      }

      const res = await fetch('https://gql.hashnode.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          query: mutation,
          variables: { input: postInput },
        }),
      })

      const data = await res.json()

      if (data.errors) {
        return { success: false, error: `Hashnode error: ${data.errors[0].message}` }
      }

      const post = data.data?.publishPost?.post
      return {
        success: true,
        publishedUrl: post?.url,
        externalId: post?.id,
      }
    } catch (error) {
      return {
        success: false,
        error: `Hashnode publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

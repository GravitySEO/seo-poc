import { SocialPlatformAdapter, ShareRequest, ShareResult } from '../types'

export class LinkedInAdapter implements SocialPlatformAdapter {
  platform = 'linkedin'

  async share(request: ShareRequest, credentials: Record<string, string>): Promise<ShareResult> {
    const { accessToken, personUrn } = credentials

    if (!accessToken || !personUrn) {
      return { success: false, error: 'LinkedIn access token and person URN not configured' }
    }

    try {
      const commentary = `${request.text}\n\nRead the full article: ${request.url}`

      const res = await fetch('https://api.linkedin.com/v2/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          author: personUrn,
          commentary,
          visibility: 'PUBLIC',
          distribution: {
            feedDistribution: 'MAIN_FEED',
            targetEntities: [],
            thirdPartyDistributionChannels: [],
          },
          content: {
            article: {
              source: request.url,
              title: request.text.slice(0, 200),
            },
          },
          lifecycleState: 'PUBLISHED',
          isReshareDisabledByAuthor: false,
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        return { success: false, error: `LinkedIn API error: ${res.status} - ${error}` }
      }

      const postId = res.headers.get('x-restli-id') || ''
      return {
        success: true,
        postedUrl: `https://www.linkedin.com/feed/update/${postId}`,
        externalId: postId,
      }
    } catch (error) {
      return {
        success: false,
        error: `LinkedIn share failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

import { SocialPlatformAdapter, ShareRequest, ShareResult } from '../types'

export class FacebookAdapter implements SocialPlatformAdapter {
  platform = 'facebook'

  async share(request: ShareRequest, credentials: Record<string, string>): Promise<ShareResult> {
    const { pageId, pageAccessToken } = credentials

    if (!pageId || !pageAccessToken) {
      return { success: false, error: 'Facebook Page ID and Access Token not configured' }
    }

    try {
      const message = `${request.text}\n\nRead more: ${request.url}`

      const res = await fetch(
        `https://graph.facebook.com/v22.0/${pageId}/feed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            link: request.url,
            access_token: pageAccessToken,
          }),
        }
      )

      if (!res.ok) {
        const error = await res.text()
        return { success: false, error: `Facebook API error: ${res.status} - ${error}` }
      }

      const data = await res.json()
      return {
        success: true,
        postedUrl: `https://facebook.com/${data.id}`,
        externalId: data.id,
      }
    } catch (error) {
      return {
        success: false,
        error: `Facebook share failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

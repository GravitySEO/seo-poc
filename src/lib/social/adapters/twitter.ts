import { SocialPlatformAdapter, ShareRequest, ShareResult } from '../types'
import crypto from 'crypto'

export class TwitterAdapter implements SocialPlatformAdapter {
  platform = 'twitter'

  async share(request: ShareRequest, credentials: Record<string, string>): Promise<ShareResult> {
    const { apiKey, apiSecret, accessToken, accessTokenSecret } = credentials

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      return { success: false, error: 'Twitter API credentials not fully configured' }
    }

    try {
      const tweetText = `${request.text}\n\n${request.url}${
        request.tags?.length ? '\n' + request.tags.map((t) => `#${t.replace(/\s+/g, '')}`).join(' ') : ''
      }`

      // OAuth 1.0a signing
      const oauthParams: Record<string, string> = {
        oauth_consumer_key: apiKey,
        oauth_nonce: crypto.randomBytes(16).toString('hex'),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: String(Math.floor(Date.now() / 1000)),
        oauth_token: accessToken,
        oauth_version: '1.0',
      }

      const method = 'POST'
      const url = 'https://api.twitter.com/2/tweets'

      const paramString = Object.keys(oauthParams)
        .sort()
        .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(oauthParams[k])}`)
        .join('&')

      const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`
      const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessTokenSecret)}`
      const signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64')

      oauthParams.oauth_signature = signature

      const authHeader = 'OAuth ' + Object.keys(oauthParams)
        .sort()
        .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
        .join(', ')

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({ text: tweetText.slice(0, 280) }),
      })

      if (!res.ok) {
        const error = await res.text()
        return { success: false, error: `Twitter API error: ${res.status} - ${error}` }
      }

      const data = await res.json()
      return {
        success: true,
        postedUrl: `https://twitter.com/i/web/status/${data.data.id}`,
        externalId: data.data.id,
      }
    } catch (error) {
      return {
        success: false,
        error: `Twitter share failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

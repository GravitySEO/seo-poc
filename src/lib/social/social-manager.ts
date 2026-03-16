import { SocialPlatformAdapter, ShareRequest, ShareResult } from './types'
import { TwitterAdapter } from './adapters/twitter'
import { FacebookAdapter } from './adapters/facebook'
import { LinkedInAdapter } from './adapters/linkedin'
import { InstagramAdapter } from './adapters/instagram'

const adapters: Record<string, SocialPlatformAdapter> = {
  twitter: new TwitterAdapter(),
  facebook: new FacebookAdapter(),
  linkedin: new LinkedInAdapter(),
  instagram: new InstagramAdapter(),
}

export function getSocialAdapter(platform: string): SocialPlatformAdapter | null {
  return adapters[platform] || null
}

export async function shareToMultiple(
  request: ShareRequest,
  platforms: Array<{ name: string; credentials: Record<string, string> }>
): Promise<Array<{ platform: string; result: ShareResult }>> {
  const results: Array<{ platform: string; result: ShareResult }> = []

  for (const { name, credentials } of platforms) {
    const adapter = getSocialAdapter(name)
    if (!adapter) {
      results.push({ platform: name, result: { success: false, error: `Unknown platform: ${name}` } })
      continue
    }
    const result = await adapter.share(request, credentials)
    results.push({ platform: name, result })
  }

  return results
}

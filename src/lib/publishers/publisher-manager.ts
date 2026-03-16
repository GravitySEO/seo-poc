import { PlatformPublisher, PublishRequest, PublishResult, PlatformConfig } from './types'
import { DevToPublisher } from './adapters/devto'
import { MediumPublisher } from './adapters/medium'
import { HashnodePublisher } from './adapters/hashnode'
import { WordPressPublisher } from './adapters/wordpress'
import { BloggerPublisher } from './adapters/blogger'

const publishers: Record<string, PlatformPublisher> = {
  devto: new DevToPublisher(),
  medium: new MediumPublisher(),
  hashnode: new HashnodePublisher(),
  wordpress: new WordPressPublisher(),
  blogger: new BloggerPublisher(),
}

export function getPublisher(platform: string): PlatformPublisher | null {
  return publishers[platform] || null
}

export async function publishToMultiple(
  request: PublishRequest,
  platforms: Array<{ name: string; config: PlatformConfig }>
): Promise<Array<{ platform: string; result: PublishResult }>> {
  const results: Array<{ platform: string; result: PublishResult }> = []

  for (const { name, config } of platforms) {
    const publisher = getPublisher(name)
    if (!publisher) {
      results.push({ platform: name, result: { success: false, error: `Unknown platform: ${name}` } })
      continue
    }

    const result = await publisher.publish(request, config)
    results.push({ platform: name, result })
  }

  return results
}

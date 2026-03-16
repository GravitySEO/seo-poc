import { PlatformConfig, PublishRequest, PublishResult } from '@/types/platform'

export interface PlatformPublisher {
  platform: string
  publish(request: PublishRequest, config: PlatformConfig): Promise<PublishResult>
}

export type { PublishRequest, PublishResult, PlatformConfig }

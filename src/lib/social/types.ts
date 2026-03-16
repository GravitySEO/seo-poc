export interface ShareRequest {
  text: string
  url: string
  tags?: string[]
}

export interface ShareResult {
  success: boolean
  postedUrl?: string
  externalId?: string
  error?: string
}

export interface SocialPlatformAdapter {
  platform: string
  share(request: ShareRequest, credentials: Record<string, string>): Promise<ShareResult>
}

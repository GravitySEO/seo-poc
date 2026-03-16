export interface PlatformCredentials {
  apiKey?: string
  accessToken?: string
  refreshToken?: string
  tokenExpiresAt?: Date
  blogId?: string
  siteId?: string
  publicationId?: string
  userId?: string
  pageId?: string
  apiSecret?: string
  accessTokenSecret?: string
}

export interface PlatformSettings {
  defaultTags: string[]
  publishAs: 'draft' | 'public'
  addCanonicalUrl: boolean
}

export interface PlatformConfig {
  _id?: string
  platform: string
  displayName: string
  enabled: boolean
  credentials: PlatformCredentials
  settings: PlatformSettings
  lastUsedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PublishRequest {
  title: string
  content: string
  contentMarkdown: string
  tags: string[]
  canonicalUrl?: string
  meta: {
    description: string
    ogImage?: string
  }
}

export interface PublishResult {
  success: boolean
  publishedUrl?: string
  externalId?: string
  error?: string
}

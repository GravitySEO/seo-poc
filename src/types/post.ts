import { ObjectId } from 'mongodb'

export interface PostMeta {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogImage?: string
  canonicalUrl?: string
}

export interface PostBacklink {
  anchorText: string
  targetUrl: string
  position: 'intro' | 'body' | 'conclusion'
}

export interface PlatformResult {
  platform: string
  status: 'pending' | 'published' | 'failed'
  publishedUrl?: string
  publishedAt?: Date
  externalId?: string
  error?: string
}

export interface SocialResult {
  platform: string
  status: 'pending' | 'posted' | 'failed'
  postedUrl?: string
  postedAt?: Date
  externalId?: string
  error?: string
}

export interface FeaturedImage {
  url: string
  alt: string
}

export interface Post {
  _id?: ObjectId
  title: string
  slug: string
  content: string
  contentHtml: string
  excerpt: string
  featuredImage?: FeaturedImage
  targetKeyword: string
  secondaryKeywords: string[]
  meta: PostMeta
  category: string
  tags: string[]
  backlinks: PostBacklink[]
  status: 'draft' | 'ready' | 'publishing' | 'published' | 'failed'
  scheduledAt?: Date
  publishedAt?: Date
  platformResults: PlatformResult[]
  socialResults: SocialResult[]
  aiModel: string
  generationPrompt?: string
  wordCount: number
  readingTime: number
  createdAt: Date
  updatedAt: Date
}

export interface PostListItem {
  _id: string
  title: string
  slug: string
  category: string
  status: string
  targetKeyword: string
  wordCount: number
  platformResults: PlatformResult[]
  createdAt: string
  updatedAt: string
}

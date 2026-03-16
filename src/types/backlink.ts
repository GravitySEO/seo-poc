import { ObjectId } from 'mongodb'

export interface Backlink {
  _id?: ObjectId
  postId: ObjectId
  platform: string
  publishedUrl: string
  targetUrl: string
  anchorText: string
  status: 'active' | 'broken' | 'removed' | 'unknown'
  lastCheckedAt?: Date
  createdAt: Date
}

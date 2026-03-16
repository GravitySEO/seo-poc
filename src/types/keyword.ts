import { ObjectId } from 'mongodb'

export interface Keyword {
  _id?: ObjectId
  keyword: string
  category: string
  difficulty: 'low' | 'medium' | 'high'
  status: 'suggested' | 'approved' | 'used' | 'rejected'
  relatedKeywords: string[]
  suggestedTopics: string[]
  source: 'ai_generated' | 'manual'
  usedInPostId?: ObjectId
  createdAt: Date
  updatedAt: Date
}

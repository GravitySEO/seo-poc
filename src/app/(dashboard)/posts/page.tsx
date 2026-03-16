'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Sparkles, Search, Trash2, ExternalLink } from 'lucide-react'

interface PostItem {
  _id: string
  title: string
  slug: string
  category: string
  status: string
  targetKeyword: string
  wordCount: number
  platformResults: Array<{ platform: string; status: string; publishedUrl?: string }>
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'ready', label: 'Ready' },
  { value: 'publishing', label: 'Publishing' },
  { value: 'published', label: 'Published' },
  { value: 'failed', label: 'Failed' },
]

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'UPSC', label: 'UPSC' },
  { value: 'SSC', label: 'SSC' },
  { value: 'Banking', label: 'Banking' },
  { value: 'Railways', label: 'Railways' },
  { value: 'GATE', label: 'GATE' },
  { value: 'CAT', label: 'CAT' },
  { value: 'NDA', label: 'NDA/CDS' },
  { value: 'State PSC', label: 'State PSC' },
  { value: 'Teaching', label: 'Teaching' },
  { value: 'General', label: 'General' },
]

export default function PostsPage() {
  const [posts, setPosts] = useState<PostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPosts = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '20')
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (category) params.set('category', category)

    try {
      const res = await fetch(`/api/posts?${params}`)
      const data = await res.json()
      if (data.success) {
        setPosts(data.data)
        setTotalPages(data.totalPages)
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [page, status, category])

  const handleSearch = () => {
    setPage(1)
    fetchPosts()
  }

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      setPosts((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      console.error('Failed to delete post:', err)
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'published': return 'success' as const
      case 'ready': return 'default' as const
      case 'draft': return 'secondary' as const
      case 'publishing': return 'warning' as const
      case 'failed': return 'destructive' as const
      default: return 'outline' as const
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground mt-1">Manage all generated blog posts</p>
        </div>
        <Link href="/generate">
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate New
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          options={STATUS_OPTIONS}
          className="w-40"
        />
        <Select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          options={CATEGORY_OPTIONS}
          className="w-40"
        />
      </div>

      {/* Posts list */}
      {loading ? (
        <p className="text-muted-foreground">Loading posts...</p>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No posts found.</p>
            <Link href="/generate">
              <Button variant="outline" className="mt-4">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate your first post
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post._id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/posts/${post._id}`}
                      className="text-base font-semibold hover:text-primary transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant={statusColor(post.status)}>{post.status}</Badge>
                      <Badge variant="outline">{post.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {post.wordCount} words
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Keyword: {post.targetKeyword}
                      </span>
                    </div>
                    {post.platformResults?.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {post.platformResults.map((pr, i) => (
                          <Badge
                            key={i}
                            variant={pr.status === 'published' ? 'success' : 'destructive'}
                            className="text-xs"
                          >
                            {pr.platform}
                            {pr.publishedUrl && (
                              <a href={pr.publishedUrl} target="_blank" rel="noopener noreferrer" className="ml-1">
                                <ExternalLink className="h-3 w-3 inline" />
                              </a>
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => deletePost(post._id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

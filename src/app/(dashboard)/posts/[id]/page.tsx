'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, Save, Send, Eye, Edit3, Loader2, ExternalLink, Copy, Share2
} from 'lucide-react'

interface Post {
  _id: string
  title: string
  slug: string
  content: string
  contentHtml: string
  excerpt: string
  targetKeyword: string
  secondaryKeywords: string[]
  meta: { title: string; description: string; ogTitle: string; ogDescription: string }
  category: string
  tags: string[]
  backlinks: Array<{ anchorText: string; targetUrl: string; position: string }>
  status: string
  wordCount: number
  readingTime: number
  platformResults: Array<{ platform: string; status: string; publishedUrl?: string; error?: string }>
  socialResults: Array<{ platform: string; status: string; postedUrl?: string; error?: string }>
  createdAt: string
  updatedAt: string
}

interface PlatformConfig {
  platform: string
  displayName: string
  type?: string
  enabled: boolean
  hasCredentials: boolean
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [editing, setEditing] = useState(false)
  const [preview, setPreview] = useState(true)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editExcerpt, setEditExcerpt] = useState('')
  const [allPlatforms, setAllPlatforms] = useState<PlatformConfig[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedSocial, setSelectedSocial] = useState<string[]>([])
  const [showPublish, setShowPublish] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [shareText, setShareText] = useState('')
  const [publishResults, setPublishResults] = useState<Array<{ platform: string; status: string; publishedUrl?: string; error?: string }>>([])
  const [shareResults, setShareResults] = useState<Array<{ platform: string; status: string; postedUrl?: string; error?: string }>>([])

  useEffect(() => {
    fetchPost()
    fetchPlatforms()
  }, [postId])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}`)
      const data = await res.json()
      if (data.success) {
        setPost(data.data)
        setEditContent(data.data.content)
        setEditTitle(data.data.title)
        setEditExcerpt(data.data.excerpt)
        setShareText(`${data.data.title} - Check out this helpful guide for competitive exam preparation!`)
      }
    } catch (err) {
      console.error('Failed to fetch post:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPlatforms = async () => {
    try {
      const res = await fetch('/api/platforms')
      const data = await res.json()
      if (data.success) setAllPlatforms(data.data)
    } catch (err) {
      console.error('Failed to fetch platforms:', err)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          excerpt: editExcerpt,
          status: 'ready',
        }),
      })
      setEditing(false)
      fetchPost()
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (selectedPlatforms.length === 0) return
    setPublishing(true)
    setPublishResults([])

    try {
      const res = await fetch(`/api/posts/${postId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms: selectedPlatforms }),
      })
      const data = await res.json()
      if (data.success) {
        setPublishResults(data.data)
        fetchPost()
      }
    } catch (err) {
      console.error('Failed to publish:', err)
    } finally {
      setPublishing(false)
    }
  }

  const handleShare = async () => {
    if (selectedSocial.length === 0) return
    setSharing(true)
    setShareResults([])

    try {
      const res = await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms: selectedSocial, customText: shareText }),
      })
      const data = await res.json()
      if (data.success) {
        setShareResults(data.data)
        fetchPost()
      }
    } catch (err) {
      console.error('Failed to share:', err)
    } finally {
      setSharing(false)
    }
  }

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    )
  }

  const toggleSocial = (platform: string) => {
    setSelectedSocial((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    )
  }

  const copyContent = () => {
    navigator.clipboard.writeText(post?.content || '')
  }

  if (loading) return <p className="text-muted-foreground">Loading post...</p>
  if (!post) return <p className="text-destructive">Post not found</p>

  const blogPlatforms = allPlatforms.filter((p) => !p.type || p.type === 'blog')
  const socialPlatforms = allPlatforms.filter((p) => p.type === 'social')

  const statusColor = (s: string) => {
    switch (s) {
      case 'published': case 'posted': return 'success' as const
      case 'ready': return 'default' as const
      case 'draft': return 'secondary' as const
      case 'failed': return 'destructive' as const
      default: return 'outline' as const
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/posts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusColor(post.status)}>{post.status}</Badge>
              <Badge variant="outline">{post.category}</Badge>
              <span className="text-xs text-muted-foreground">
                {post.wordCount} words &middot; {post.readingTime} min read
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyContent}>
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          )}
          <Button size="sm" onClick={() => { setShowPublish(!showPublish); setShowShare(false) }}>
            <Send className="mr-2 h-4 w-4" /> Publish
          </Button>
          <Button size="sm" variant="secondary" onClick={() => { setShowShare(!showShare); setShowPublish(false) }}>
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      {/* Publish to Blog Platforms panel */}
      {showPublish && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Send className="h-4 w-4" /> Publish to Blog Platforms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {blogPlatforms.map((p) => (
                <button
                  key={p.platform}
                  onClick={() => p.enabled && p.hasCredentials && togglePlatform(p.platform)}
                  disabled={!p.enabled || !p.hasCredentials}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedPlatforms.includes(p.platform)
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  } ${(!p.enabled || !p.hasCredentials) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <p className="font-medium text-sm">{p.displayName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {!p.enabled ? 'Disabled' : !p.hasCredentials ? 'Not configured' : 'Ready'}
                  </p>
                </button>
              ))}
            </div>

            {publishResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Results:</h4>
                {publishResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant={r.status === 'published' ? 'success' : 'destructive'}>
                      {r.platform}
                    </Badge>
                    <span>{r.status === 'published' ? 'Published' : `Failed: ${r.error}`}</span>
                    {r.publishedUrl && (
                      <a href={r.publishedUrl} target="_blank" rel="noopener noreferrer" className="text-primary">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handlePublish}
              disabled={publishing || selectedPlatforms.length === 0}
            >
              {publishing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</>
              ) : (
                <><Send className="mr-2 h-4 w-4" /> Publish to {selectedPlatforms.length} platform(s)</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Share to Social Media panel */}
      {showShare && (
        <Card className="border-blue-300">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 className="h-4 w-4" /> Share on Social Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Text</label>
              <Textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                rows={3}
                placeholder="Write a message to accompany the shared link..."
              />
              <p className="text-xs text-muted-foreground">
                The post URL and hashtags will be appended automatically.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {socialPlatforms.map((p) => (
                <button
                  key={p.platform}
                  onClick={() => p.enabled && p.hasCredentials && toggleSocial(p.platform)}
                  disabled={!p.enabled || !p.hasCredentials}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedSocial.includes(p.platform)
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-muted'
                  } ${(!p.enabled || !p.hasCredentials) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <p className="font-medium text-sm">{p.displayName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {!p.enabled ? 'Disabled' : !p.hasCredentials ? 'Not configured' : 'Ready'}
                  </p>
                </button>
              ))}
            </div>

            {shareResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Results:</h4>
                {shareResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Badge variant={r.status === 'posted' ? 'success' : 'destructive'}>
                      {r.platform}
                    </Badge>
                    <span>{r.status === 'posted' ? 'Shared' : `Failed: ${r.error}`}</span>
                    {r.postedUrl && (
                      <a href={r.postedUrl} target="_blank" rel="noopener noreferrer" className="text-primary">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleShare}
              disabled={sharing || selectedSocial.length === 0}
              variant="secondary"
            >
              {sharing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sharing...</>
              ) : (
                <><Share2 className="mr-2 h-4 w-4" /> Share to {selectedSocial.length} platform(s)</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Previously published blogs */}
      {post.platformResults?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Published Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {post.platformResults.map((pr, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Badge variant={pr.status === 'published' ? 'success' : 'destructive'}>{pr.platform}</Badge>
                    <span className="text-sm">{pr.status}</span>
                  </div>
                  {pr.publishedUrl && (
                    <a href={pr.publishedUrl} target="_blank" rel="noopener noreferrer"
                      className="text-primary text-sm flex items-center gap-1">
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previously shared on social */}
      {post.socialResults?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shared on Social Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {post.socialResults.map((sr, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Badge variant={sr.status === 'posted' ? 'success' : 'destructive'}>{sr.platform}</Badge>
                    <span className="text-sm">{sr.status}</span>
                    {sr.error && <span className="text-xs text-destructive">{sr.error}</span>}
                  </div>
                  {sr.postedUrl && (
                    <a href={sr.postedUrl} target="_blank" rel="noopener noreferrer"
                      className="text-primary text-sm flex items-center gap-1">
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meta tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SEO Meta Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Meta Title</span>
            <p className="text-sm">{post.meta?.title || 'Not generated'}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Meta Description</span>
            <p className="text-sm">{post.meta?.description || 'Not generated'}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Target Keyword</span>
              <p className="text-sm">{post.targetKeyword}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Tags</span>
              <div className="flex gap-1 mt-1">
                {post.tags?.map((t, i) => <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backlinks */}
      {post.backlinks?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Embedded Backlinks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {post.backlinks.map((bl, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <Badge variant="outline">{bl.position}</Badge>
                  <span className="font-medium">{bl.anchorText}</span>
                  <span className="text-muted-foreground">-&gt;</span>
                  <span className="text-primary">{bl.targetUrl}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Content</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={preview ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreview(true)}
              >
                <Eye className="mr-1 h-3 w-3" /> Preview
              </Button>
              <Button
                variant={!preview ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setPreview(false); setEditing(true) }}
              >
                <Edit3 className="mr-1 h-3 w-3" /> Markdown
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {editing && !preview ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Excerpt</label>
                <Input value={editExcerpt} onChange={(e) => setEditExcerpt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content (Markdown)</label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={30}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          ) : (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Link2, ExternalLink, RefreshCw, Loader2 } from 'lucide-react'

interface BacklinkItem {
  _id: string
  postId: string
  platform: string
  publishedUrl: string
  targetUrl: string
  anchorText: string
  status: string
  lastCheckedAt?: string
  createdAt: string
}

interface BacklinkStats {
  total: number
  active: number
  broken: number
  byPlatform: Array<{ _id: string; count: number }>
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'broken', label: 'Broken' },
  { value: 'removed', label: 'Removed' },
  { value: 'unknown', label: 'Unknown' },
]

const PLATFORM_OPTIONS = [
  { value: '', label: 'All Platforms' },
  { value: 'devto', label: 'Dev.to' },
  { value: 'medium', label: 'Medium' },
  { value: 'blogger', label: 'Blogger' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'hashnode', label: 'Hashnode' },
]

export default function BacklinksPage() {
  const [backlinks, setBacklinks] = useState<BacklinkItem[]>([])
  const [stats, setStats] = useState<BacklinkStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [platform, setPlatform] = useState('')
  const [status, setStatus] = useState('')

  const fetchBacklinks = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (platform) params.set('platform', platform)
    if (status) params.set('status', status)

    try {
      const [blRes, statsRes] = await Promise.all([
        fetch(`/api/backlinks?${params}`),
        fetch('/api/backlinks/stats'),
      ])
      const blData = await blRes.json()
      const statsData = await statsRes.json()
      if (blData.success) setBacklinks(blData.data)
      if (statsData.success) setStats(statsData.data)
    } catch (err) {
      console.error('Failed to fetch backlinks:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBacklinks()
  }, [platform, status])

  const checkBacklinks = async () => {
    setChecking(true)
    try {
      await fetch('/api/backlinks/check', { method: 'POST' })
      fetchBacklinks()
    } catch (err) {
      console.error('Backlink check failed:', err)
    } finally {
      setChecking(false)
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return 'success' as const
      case 'broken': return 'destructive' as const
      case 'removed': return 'warning' as const
      default: return 'secondary' as const
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backlinks</h1>
          <p className="text-muted-foreground mt-1">Track all backlinks to scoreboat.com</p>
        </div>
        <Button variant="outline" onClick={checkBacklinks} disabled={checking}>
          {checking ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</>
          ) : (
            <><RefreshCw className="mr-2 h-4 w-4" /> Check Health</>
          )}
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.broken}</p>
              <p className="text-sm text-muted-foreground">Broken</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium mb-2">By Platform</p>
              <div className="space-y-1">
                {stats.byPlatform.map((bp) => (
                  <div key={bp._id} className="flex justify-between text-sm">
                    <span>{bp._id}</span>
                    <span className="font-medium">{bp.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <Select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          options={PLATFORM_OPTIONS}
          className="w-48"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={STATUS_OPTIONS}
          className="w-48"
        />
      </div>

      {/* Backlinks list */}
      {loading ? (
        <p className="text-muted-foreground">Loading backlinks...</p>
      ) : backlinks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Link2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No backlinks yet. Publish content to create backlinks.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {backlinks.map((bl) => (
            <Card key={bl._id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusColor(bl.status)}>{bl.status}</Badge>
                      <Badge variant="outline">{bl.platform}</Badge>
                      <span className="text-sm font-medium">{bl.anchorText}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>Target: {bl.targetUrl}</span>
                      <span>&middot;</span>
                      <span>{new Date(bl.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {bl.publishedUrl && (
                    <a href={bl.publishedUrl} target="_blank" rel="noopener noreferrer"
                      className="text-primary flex items-center gap-1 text-sm shrink-0">
                      View <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

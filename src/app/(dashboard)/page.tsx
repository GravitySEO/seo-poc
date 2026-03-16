'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Search, Link2, Sparkles, ArrowRight, Settings2 } from 'lucide-react'

interface DashboardStats {
  totalPosts: number
  publishedPosts: number
  totalKeywords: number
  activeBacklinks: number
  recentPosts: Array<{
    _id: string
    title: string
    status: string
    createdAt: string
    category: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    {
      title: 'Total Posts',
      value: stats?.totalPosts ?? 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Published',
      value: stats?.publishedPosts ?? 0,
      icon: Sparkles,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Keywords',
      value: stats?.totalKeywords ?? 0,
      icon: Search,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Active Backlinks',
      value: stats?.activeBacklinks ?? 0,
      icon: Link2,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  const statusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success' as const
      case 'ready': return 'default' as const
      case 'draft': return 'secondary' as const
      case 'failed': return 'destructive' as const
      default: return 'outline' as const
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            SEO Blog Automation for ScoreBoat.com
          </p>
        </div>
        <Link href="/generate">
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Content
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1">
                    {loading ? '-' : stat.value}
                  </p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Posts</CardTitle>
            <Link href="/posts">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : stats?.recentPosts?.length ? (
              <div className="space-y-3">
                {stats.recentPosts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/posts/${post._id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {post.category} &middot; {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={statusColor(post.status)}>{post.status}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No posts yet</p>
                <Link href="/generate">
                  <Button variant="outline" size="sm" className="mt-2">
                    Generate your first post
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/generate" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Generate Blog Post</p>
                  <p className="text-xs text-muted-foreground">Create AI-powered SEO content</p>
                </div>
              </div>
            </Link>
            <Link href="/keywords" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                <Search className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Research Keywords</p>
                  <p className="text-xs text-muted-foreground">Find trending exam topics</p>
                </div>
              </div>
            </Link>
            <Link href="/platforms" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                <Settings2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Configure Platforms</p>
                  <p className="text-xs text-muted-foreground">Set up publishing destinations</p>
                </div>
              </div>
            </Link>
            <Link href="/backlinks" className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                <Link2 className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Track Backlinks</p>
                  <p className="text-xs text-muted-foreground">Monitor link health & status</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

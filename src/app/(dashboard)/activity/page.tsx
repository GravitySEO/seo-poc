'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity } from 'lucide-react'

interface ActivityItem {
  _id: string
  action: string
  postId?: string
  platform?: string
  details?: Record<string, unknown>
  status: string
  error?: string
  timestamp: string
}

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchActivity = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/activity?page=${page}&limit=30`)
      const data = await res.json()
      if (data.success) {
        setItems(data.data)
        setTotal(data.total)
      }
    } catch (err) {
      console.error('Failed to fetch activity:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
  }, [page])

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground mt-1">
          Full audit trail of all operations ({total} total)
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading activity...</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No activity yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item._id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={item.status === 'success' ? 'success' : 'destructive'}>
                      {item.status}
                    </Badge>
                    <span className="text-sm font-medium">{formatAction(item.action)}</span>
                    {item.platform && (
                      <Badge variant="outline">{item.platform}</Badge>
                    )}
                    {item.error && (
                      <span className="text-xs text-destructive">{item.error}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {total > 30 && (
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
                Page {page} of {Math.ceil(total / 30)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / 30)}
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

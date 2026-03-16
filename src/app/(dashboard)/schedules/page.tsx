'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Plus, Trash2, Loader2 } from 'lucide-react'

interface Schedule {
  _id: string
  type: string
  cronExpression: string
  config: { category?: string; platforms?: string[] }
  enabled: boolean
  lastRunAt?: string
  nextRunAt?: string
  runCount: number
  createdAt: string
}

const SCHEDULE_TYPES = [
  { value: 'generate', label: 'Auto Generate Content' },
  { value: 'check_backlinks', label: 'Check Backlinks' },
]

const CRON_PRESETS = [
  { value: '0 9 * * 1', label: 'Every Monday at 9 AM' },
  { value: '0 9 * * *', label: 'Every day at 9 AM' },
  { value: '0 9 * * 1,4', label: 'Mon & Thu at 9 AM' },
  { value: '0 9 1 * *', label: 'First of every month' },
  { value: '0 */6 * * *', label: 'Every 6 hours' },
]

const CATEGORIES = [
  { value: 'UPSC', label: 'UPSC' },
  { value: 'SSC', label: 'SSC' },
  { value: 'Banking', label: 'Banking' },
  { value: 'Railways', label: 'Railways' },
  { value: 'GATE', label: 'GATE' },
  { value: 'General', label: 'General' },
]

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newType, setNewType] = useState('generate')
  const [newCron, setNewCron] = useState('0 9 * * 1')
  const [newCategory, setNewCategory] = useState('UPSC')

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedules')
      const data = await res.json()
      if (data.success) setSchedules(data.data)
    } catch (err) {
      console.error('Failed to fetch schedules:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const createSchedule = async () => {
    setCreating(true)
    try {
      await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newType,
          cronExpression: newCron,
          config: { category: newCategory },
          enabled: true,
        }),
      })
      setShowCreate(false)
      fetchSchedules()
    } catch (err) {
      console.error('Failed to create schedule:', err)
    } finally {
      setCreating(false)
    }
  }

  const toggleSchedule = async (id: string, enabled: boolean) => {
    try {
      await fetch(`/api/schedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      })
      setSchedules((prev) =>
        prev.map((s) => (s._id === id ? { ...s, enabled } : s))
      )
    } catch (err) {
      console.error('Failed to update schedule:', err)
    }
  }

  const deleteSchedule = async (id: string) => {
    if (!confirm('Delete this schedule?')) return
    try {
      await fetch(`/api/schedules/${id}`, { method: 'DELETE' })
      setSchedules((prev) => prev.filter((s) => s._id !== id))
    } catch (err) {
      console.error('Failed to delete schedule:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedules</h1>
          <p className="text-muted-foreground mt-1">Automate content generation and tasks</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="mr-2 h-4 w-4" /> New Schedule
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create Schedule</CardTitle>
            <CardDescription>Set up automated recurring tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Type</label>
                <Select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  options={SCHEDULE_TYPES}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  options={CATEGORIES}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule (Cron Preset)</label>
              <Select
                value={newCron}
                onChange={(e) => setNewCron(e.target.value)}
                options={CRON_PRESETS}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Cron (override)</label>
              <Input
                value={newCron}
                onChange={(e) => setNewCron(e.target.value)}
                placeholder="e.g., 0 9 * * 1"
              />
              <p className="text-xs text-muted-foreground">
                Format: minute hour day-of-month month day-of-week
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={createSchedule} disabled={creating}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading schedules...</p>
      ) : schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No schedules configured yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => (
            <Card key={s._id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{s.type.replace('_', ' ')}</span>
                      <Badge variant={s.enabled ? 'success' : 'secondary'}>
                        {s.enabled ? 'Active' : 'Paused'}
                      </Badge>
                      {s.config?.category && (
                        <Badge variant="outline">{s.config.category}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cron: {s.cronExpression} &middot; Runs: {s.runCount || 0}
                      {s.lastRunAt && ` &middot; Last: ${new Date(s.lastRunAt).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSchedule(s._id, !s.enabled)}
                    >
                      {s.enabled ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => deleteSchedule(s._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

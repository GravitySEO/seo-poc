'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Settings, Save, Loader2, Globe } from 'lucide-react'

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [backlinkTargets, setBacklinkTargets] = useState(
    `https://scoreboat.com|scoreboat.com
https://scoreboat.com|competitive exam preparation
https://scoreboat.com|exam preparation resources`
  )

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      setMessage(data.success ? 'Password changed successfully' : data.error || 'Failed')
      if (data.success) {
        setCurrentPassword('')
        setNewPassword('')
      }
    } catch {
      setMessage('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Application settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-destructive'}`}>
              {message}
            </p>
          )}
          <Button onClick={handleChangePassword} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Change Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Backlink Targets
          </CardTitle>
          <CardDescription>
            Define URLs and anchor text for backlinks (one per line, format: URL|Anchor Text)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={backlinkTargets}
            onChange={(e) => setBacklinkTargets(e.target.value)}
            rows={6}
            className="font-mono text-sm"
            placeholder="https://scoreboat.com|scoreboat.com"
          />
          <p className="text-xs text-muted-foreground">
            These backlinks will be embedded naturally in generated blog posts.
            AI will choose 2-3 per post where they fit contextually.
          </p>
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" /> Save Targets
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>GravitySEO Automation</strong> v1.0.0</p>
          <p>SEO Blog Automation Tool for ScoreBoat.com</p>
          <p>AI Model: Groq / llama-3.1-8b-instant</p>
          <p>Database: MongoDB Atlas</p>
        </CardContent>
      </Card>
    </div>
  )
}

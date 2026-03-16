'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Sparkles, Loader2, Check, X, Trash2 } from 'lucide-react'

const CATEGORIES = [
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

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'suggested', label: 'Suggested' },
  { value: 'approved', label: 'Approved' },
  { value: 'used', label: 'Used' },
  { value: 'rejected', label: 'Rejected' },
]

interface KeywordItem {
  _id: string
  keyword: string
  category: string
  difficulty: string
  status: string
  relatedKeywords: string[]
  suggestedTopics: string[]
  source: string
  createdAt: string
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<KeywordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [category, setCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [genCategory, setGenCategory] = useState('UPSC')
  const [manualKeyword, setManualKeyword] = useState('')
  const [manualCategory, setManualCategory] = useState('UPSC')

  const fetchKeywords = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (statusFilter) params.set('status', statusFilter)

    try {
      const res = await fetch(`/api/keywords?${params}`)
      const data = await res.json()
      if (data.success) setKeywords(data.data)
    } catch (err) {
      console.error('Failed to fetch keywords:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKeywords()
  }, [category, statusFilter])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/suggest-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: genCategory }),
      })
      const data = await res.json()
      if (data.success) {
        fetchKeywords()
      }
    } catch (err) {
      console.error('Failed to generate keywords:', err)
    } finally {
      setGenerating(false)
    }
  }

  const updateKeywordStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/keywords/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setKeywords((prev) =>
        prev.map((kw) => (kw._id === id ? { ...kw, status } : kw))
      )
    } catch (err) {
      console.error('Failed to update keyword:', err)
    }
  }

  const deleteKeyword = async (id: string) => {
    try {
      await fetch(`/api/keywords/${id}`, { method: 'DELETE' })
      setKeywords((prev) => prev.filter((kw) => kw._id !== id))
    } catch (err) {
      console.error('Failed to delete keyword:', err)
    }
  }

  const addManualKeyword = async () => {
    if (!manualKeyword.trim()) return
    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: manualKeyword, category: manualCategory }),
      })
      const data = await res.json()
      if (data.success) {
        setManualKeyword('')
        fetchKeywords()
      }
    } catch (err) {
      console.error('Failed to add keyword:', err)
    }
  }

  const difficultyColor = (d: string) => {
    switch (d) {
      case 'low': return 'success' as const
      case 'medium': return 'warning' as const
      case 'high': return 'destructive' as const
      default: return 'secondary' as const
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case 'approved': return 'success' as const
      case 'suggested': return 'default' as const
      case 'used': return 'secondary' as const
      case 'rejected': return 'destructive' as const
      default: return 'outline' as const
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Keywords</h1>
          <p className="text-muted-foreground mt-1">Research and manage SEO keywords</p>
        </div>
      </div>

      {/* Generate & Add keywords */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Keyword Research
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={genCategory}
              onChange={(e) => setGenCategory(e.target.value)}
              options={CATEGORIES.filter((c) => c.value)}
            />
            <Button onClick={handleGenerate} disabled={generating} className="w-full">
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating keywords...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate 15 Keywords
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" />
              Add Keyword Manually
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={manualKeyword}
              onChange={(e) => setManualKeyword(e.target.value)}
              placeholder="Enter keyword..."
              onKeyDown={(e) => e.key === 'Enter' && addManualKeyword()}
            />
            <div className="flex gap-2">
              <Select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                options={CATEGORIES.filter((c) => c.value)}
                className="flex-1"
              />
              <Button onClick={addManualKeyword} disabled={!manualKeyword.trim()}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORIES}
          className="w-48"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={STATUS_OPTIONS}
          className="w-48"
        />
      </div>

      {/* Keywords list */}
      {loading ? (
        <p className="text-muted-foreground">Loading keywords...</p>
      ) : keywords.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No keywords found. Generate some using AI!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {keywords.map((kw) => (
            <Card key={kw._id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{kw.keyword}</span>
                      <Badge variant={difficultyColor(kw.difficulty)}>{kw.difficulty}</Badge>
                      <Badge variant={statusColor(kw.status)}>{kw.status}</Badge>
                      <Badge variant="outline">{kw.category}</Badge>
                    </div>
                    {kw.relatedKeywords?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Related: {kw.relatedKeywords.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {kw.status === 'suggested' && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600"
                          onClick={() => updateKeywordStatus(kw._id, 'approved')}
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600"
                          onClick={() => updateKeywordStatus(kw._id, 'rejected')}
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => deleteKeyword(kw._id)}
                      title="Delete"
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

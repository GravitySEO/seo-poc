'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles, Search, ArrowRight, Loader2,
  Brain, PenLine, BookOpen, Zap, Tag, ImageIcon, Database, Check,
} from 'lucide-react'

const CATEGORIES = [
  { value: 'UPSC', label: 'UPSC' },
  { value: 'SSC', label: 'SSC' },
  { value: 'Banking', label: 'Banking (IBPS/SBI)' },
  { value: 'Railways', label: 'Railways (RRB)' },
  { value: 'GATE', label: 'GATE' },
  { value: 'CAT', label: 'CAT' },
  { value: 'NDA', label: 'NDA/CDS' },
  { value: 'State PSC', label: 'State PSC' },
  { value: 'Teaching', label: 'Teaching (CTET/TET)' },
  { value: 'General', label: 'General Competitive Exams' },
]

const GENERATION_STEPS = [
  {
    icon: Brain,
    label: 'Generating outline',
    sublabel: 'Planning sections, structure & backlink placements',
    duration: 6000,
  },
  {
    icon: PenLine,
    label: 'Writing introduction',
    sublabel: 'Crafting an engaging hook for exam aspirants',
    duration: 5000,
  },
  {
    icon: BookOpen,
    label: 'Writing blog sections',
    sublabel: 'Generating detailed sections with examples & keywords',
    duration: 20000,
  },
  {
    icon: PenLine,
    label: 'Writing conclusion',
    sublabel: 'Adding call-to-action linking to scoreboat.com',
    duration: 4000,
  },
  {
    icon: Zap,
    label: 'Polishing & optimising',
    sublabel: 'Improving readability, flow & keyword density',
    duration: 7000,
  },
  {
    icon: Tag,
    label: 'Generating meta tags',
    sublabel: 'Crafting SEO title & description for search engines',
    duration: 4000,
  },
  {
    icon: ImageIcon,
    label: 'Fetching featured image',
    sublabel: 'Finding a relevant photo from Pexels',
    duration: 5000,
  },
  {
    icon: Database,
    label: 'Saving your blog post',
    sublabel: 'Storing content, metadata & image in the database',
    duration: 3000,
  },
]

const TIPS = [
  '💡 Blog posts with images receive 2.3× more engagement than text-only posts',
  '📈 Long-form content (1,500+ words) ranks 3× higher on Google search results',
  '🔗 Backlinks to scoreboat.com help improve your domain authority over time',
  '⚡ A good meta description can improve click-through rates by up to 5.8%',
  '🔑 Secondary keywords help you capture related search traffic organically',
  '📊 Blogs published consistently rank faster than sporadic publishing',
  '🌟 Competitive exam content spikes during admit card & result seasons',
  '🎯 Targeting a single keyword per post gives 23% better ranking chances',
  '📱 Over 60% of exam aspirants browse study content on mobile devices',
  '✍️ Posts that answer specific questions get featured in Google snippets',
]

// ── Generating overlay ──────────────────────────────────────────────────────

function GeneratingView({ title }: { title: string }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)
  const [tipVisible, setTipVisible] = useState(true)
  const [dots, setDots] = useState('.')

  // Animate trailing dots
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? '.' : d + '.')), 500)
    return () => clearInterval(id)
  }, [])

  // Advance through steps based on approximate server timing
  useEffect(() => {
    let elapsed = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []
    GENERATION_STEPS.forEach((step, i) => {
      if (i < GENERATION_STEPS.length - 1) {
        elapsed += step.duration
        timeouts.push(
          setTimeout(() => setCurrentStep((s) => Math.max(s, i + 1)), elapsed)
        )
      }
    })
    return () => timeouts.forEach(clearTimeout)
  }, [])

  // Rotate tips with a fade
  useEffect(() => {
    const id = setInterval(() => {
      setTipVisible(false)
      setTimeout(() => {
        setTipIndex((t) => (t + 1) % TIPS.length)
        setTipVisible(true)
      }, 400)
    }, 4500)
    return () => clearInterval(id)
  }, [])

  const progress = Math.min(((currentStep + 0.6) / GENERATION_STEPS.length) * 100, 96)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border shadow-2xl rounded-2xl overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-primary to-cyan-500" />

        <div className="p-7 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              {/* Live dot */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                AI Writing Agent
              </p>
              <h2 className="font-bold text-base leading-snug">
                Generating your blog{dots}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 truncate" title={title}>
                &ldquo;{title}&rdquo;
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {GENERATION_STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #6366f1, #0ea5e9)',
                }}
              />
            </div>
          </div>

          {/* Step checklist */}
          <div className="space-y-1">
            {GENERATION_STEPS.map((step, i) => {
              const Icon = step.icon
              const isDone = i < currentStep
              const isActive = i === currentStep
              const isPending = i > currentStep

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/8 border border-primary/20'
                      : isDone
                      ? 'opacity-50'
                      : 'opacity-25'
                  }`}
                >
                  {/* Status indicator */}
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                      isDone
                        ? 'bg-green-100 text-green-600'
                        : isActive
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : isActive ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm ${
                        isActive ? 'font-semibold text-primary' : 'font-medium'
                      }`}
                    >
                      {step.label}
                      {isActive && (
                        <span className="text-primary font-normal">{dots}</span>
                      )}
                    </span>
                    {isActive && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                        {step.sublabel}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Rotating tip */}
          <div
            className="bg-muted/60 rounded-xl px-4 py-3 text-xs text-muted-foreground text-center leading-relaxed transition-opacity duration-400"
            style={{ opacity: tipVisible ? 1 : 0 }}
          >
            {TIPS[tipIndex]}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

interface TopicSuggestion {
  title: string
  description: string
  secondaryKeywords: string[]
}

export default function GeneratePage() {
  const router = useRouter()
  const [step, setStep] = useState<'keyword' | 'topic' | 'generate'>('keyword')
  const [category, setCategory] = useState('UPSC')
  const [keyword, setKeyword] = useState('')
  const [topics, setTopics] = useState<TopicSuggestion[]>([])
  const [customTitle, setCustomTitle] = useState('')
  const [secondaryKeywords, setSecondaryKeywords] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleSuggestTopics = async () => {
    if (!keyword.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, category }),
      })
      const data = await res.json()
      if (data.success) {
        setTopics(data.data)
        setStep('topic')
      } else {
        setError(data.error || 'Failed to suggest topics')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTopic = (topic: TopicSuggestion) => {
    setCustomTitle(topic.title)
    setSecondaryKeywords(topic.secondaryKeywords.join(', '))
    setStep('generate')
  }

  const handleGenerate = async () => {
    if (!customTitle.trim()) return
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customTitle,
          keyword,
          secondaryKeywords: secondaryKeywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          category,
        }),
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/posts/${data.data._id}`)
      } else {
        setError(data.error || 'Failed to generate content')
        setGenerating(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setGenerating(false)
    }
  }

  return (
    <>
      {/* Generating overlay */}
      {generating && <GeneratingView title={customTitle} />}

      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Generate Content</h1>
          <p className="text-muted-foreground mt-1">
            Create SEO-optimized blog posts with AI
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {(['keyword', 'topic', 'generate'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s
                    ? 'bg-primary text-white'
                    : ['keyword', 'topic', 'generate'].indexOf(step) > i
                    ? 'bg-green-100 text-green-800'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}
              </div>
              <span className="text-sm font-medium capitalize hidden sm:inline">
                {s === 'keyword' ? 'Keyword' : s === 'topic' ? 'Topic' : 'Generate'}
              </span>
              {i < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Keyword */}
        {step === 'keyword' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Enter Target Keyword
              </CardTitle>
              <CardDescription>
                Enter a keyword related to competitive exams that you want to create content for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Exam Category</label>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={CATEGORIES}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Keyword</label>
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g., UPSC preparation tips 2024"
                  onKeyDown={(e) => e.key === 'Enter' && handleSuggestTopics()}
                />
              </div>
              <Button onClick={handleSuggestTopics} disabled={loading || !keyword.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Suggesting topics...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Suggest Blog Topics
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Topic Selection */}
        {step === 'topic' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Select a Blog Topic</h2>
              <Button variant="outline" size="sm" onClick={() => setStep('keyword')}>
                Back
              </Button>
            </div>
            <div className="grid gap-4">
              {topics.map((topic, i) => (
                <Card
                  key={i}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleSelectTopic(topic)}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{topic.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {topic.secondaryKeywords?.map((kw, j) => (
                        <Badge key={j} variant="secondary">{kw}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Or write your own title</h3>
                <div className="flex gap-2">
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Enter custom blog post title"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      if (customTitle.trim()) setStep('generate')
                    }}
                    disabled={!customTitle.trim()}
                  >
                    Use This
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Generate */}
        {step === 'generate' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Blog Post
              </CardTitle>
              <CardDescription>
                Review the details and generate your SEO-optimized blog post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Blog Title</label>
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Blog post title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Keyword</label>
                  <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    options={CATEGORIES}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Secondary Keywords (comma separated)</label>
                <Textarea
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('topic')}>
                  Back
                </Button>
                <Button onClick={handleGenerate} disabled={generating || !customTitle.trim()}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Blog Post
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

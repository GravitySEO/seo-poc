'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings2, Save, Loader2, CheckCircle, XCircle, Globe, Share2, HelpCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

interface PlatformConfig {
  _id: string
  platform: string
  displayName: string
  type?: string
  enabled: boolean
  hasCredentials: boolean
  credentials: Record<string, string>
  settings: { defaultTags: string[]; publishAs: string; addCanonicalUrl: boolean }
}

interface CredentialGuide {
  summary: string
  steps: Array<{ text: string; link?: { url: string; label: string } }>
  videoLink?: { url: string; label: string }
  tips?: string[]
}

const PLATFORM_FIELDS: Record<string, Array<{ key: string; label: string; type: string; help: string }>> = {
  // Blog platforms
  devto: [
    { key: 'apiKey', label: 'API Key', type: 'password', help: 'Settings > Extensions > DEV Community API Keys' },
  ],
  medium: [
    { key: 'accessToken', label: 'Integration Token', type: 'password', help: 'Settings > Security and apps > Integration tokens' },
  ],
  blogger: [
    { key: 'blogId', label: 'Blog ID', type: 'text', help: 'Your Blogger blog ID (from URL)' },
    { key: 'accessToken', label: 'OAuth Access Token', type: 'password', help: 'Google OAuth2 access token' },
  ],
  wordpress: [
    { key: 'siteId', label: 'Site ID / Domain', type: 'text', help: 'e.g., yoursite.wordpress.com' },
    { key: 'accessToken', label: 'Access Token', type: 'password', help: 'WordPress.com OAuth access token' },
  ],
  hashnode: [
    { key: 'publicationId', label: 'Publication ID', type: 'text', help: 'Your Hashnode publication ID' },
    { key: 'accessToken', label: 'Personal Access Token', type: 'password', help: 'Settings > Developer > Access Tokens' },
  ],
  // Social media platforms
  twitter: [
    { key: 'apiKey', label: 'API Key (Consumer Key)', type: 'password', help: 'Twitter Developer Portal > App > Keys and Tokens > API Key' },
    { key: 'apiSecret', label: 'API Secret (Consumer Secret)', type: 'password', help: 'Twitter Developer Portal > App > Keys and Tokens > API Secret' },
    { key: 'accessToken', label: 'Access Token', type: 'password', help: 'Twitter Developer Portal > App > Keys and Tokens > Access Token' },
    { key: 'accessTokenSecret', label: 'Access Token Secret', type: 'password', help: 'Twitter Developer Portal > App > Keys and Tokens > Access Token Secret' },
  ],
  facebook: [
    { key: 'pageId', label: 'Page ID', type: 'text', help: 'Your Facebook Page ID (from Page Settings > About)' },
    { key: 'pageAccessToken', label: 'Page Access Token', type: 'password', help: 'Long-lived Page Access Token from Graph API Explorer or your app' },
  ],
  instagram: [
    { key: 'businessAccountId', label: 'Business Account ID', type: 'text', help: 'Instagram Business Account ID (linked to Facebook Page). Get via Graph API: /{page-id}?fields=instagram_business_account' },
    { key: 'accessToken', label: 'Access Token', type: 'password', help: 'Same long-lived token as Facebook (requires instagram_basic, instagram_content_publish permissions)' },
    { key: 'defaultImageUrl', label: 'Default Post Image URL', type: 'text', help: 'Public URL of a branded image to use when sharing links (Instagram requires an image for every post)' },
  ],
  linkedin: [
    { key: 'accessToken', label: 'Access Token', type: 'password', help: 'OAuth2 access token with w_member_social scope (expires every 60 days)' },
    { key: 'personUrn', label: 'Person URN', type: 'text', help: 'e.g., urn:li:person:abc123 - Get from LinkedIn API /v2/userinfo' },
  ],
}

const CREDENTIAL_GUIDES: Record<string, CredentialGuide> = {
  devto: {
    summary: 'Get your free API key from DEV.to settings in under 1 minute.',
    steps: [
      { text: 'Log in to your DEV.to account (create one if needed)', link: { url: 'https://dev.to/enter', label: 'DEV.to Login' } },
      { text: 'Go to Settings > Extensions', link: { url: 'https://dev.to/settings/extensions', label: 'DEV.to API Keys' } },
      { text: 'Scroll down to "DEV Community API Keys" section' },
      { text: 'Type a description (e.g., "GravitySEO") and click "Generate API Key"' },
      { text: 'Copy the generated key and paste it above' },
    ],
    videoLink: { url: 'https://www.youtube.com/results?search_query=how+to+get+dev.to+api+key', label: 'Search: How to get DEV.to API Key' },
    tips: ['API key never expires unless you revoke it', 'You can create multiple keys for different apps'],
  },
  medium: {
    summary: 'Generate an integration token from Medium settings.',
    steps: [
      { text: 'Log in to your Medium account', link: { url: 'https://medium.com/', label: 'Medium' } },
      { text: 'Click your profile picture > Settings', link: { url: 'https://medium.com/me/settings/security', label: 'Medium Security Settings' } },
      { text: 'Go to "Security and apps" tab' },
      { text: 'Scroll to "Integration tokens" section' },
      { text: 'Enter a description (e.g., "GravitySEO") and click "Get token"' },
      { text: 'Copy the token and paste it above' },
    ],
    videoLink: { url: 'https://www.youtube.com/results?search_query=how+to+get+medium+integration+token+api', label: 'Search: How to get Medium Integration Token' },
    tips: ['Medium tokens do not expire', 'Posts are published under your Medium account'],
  },
  blogger: {
    summary: 'Requires a Google Cloud project with Blogger API enabled.',
    steps: [
      { text: 'Go to Google Cloud Console and create a new project (or select existing)', link: { url: 'https://console.cloud.google.com/projectcreate', label: 'Create Google Cloud Project' } },
      { text: 'Enable the Blogger API v3 for your project', link: { url: 'https://console.cloud.google.com/apis/library/blogger.googleapis.com', label: 'Enable Blogger API' } },
      { text: 'Go to Credentials and create an OAuth 2.0 Client ID', link: { url: 'https://console.cloud.google.com/apis/credentials', label: 'Google Credentials' } },
      { text: 'Use the OAuth Playground to generate an access token with Blogger scope', link: { url: 'https://developers.google.com/oauthplayground/', label: 'OAuth Playground' } },
      { text: 'In OAuth Playground: Select "Blogger API v3" > Authorize > Exchange code for tokens' },
      { text: 'Copy the Access Token and paste it above' },
      { text: 'For Blog ID: Open your Blogger dashboard, the ID is in the URL (e.g., blogger.com/blog/posts/YOUR_BLOG_ID)', link: { url: 'https://www.blogger.com/home', label: 'Blogger Dashboard' } },
    ],
    videoLink: { url: 'https://www.youtube.com/results?search_query=how+to+get+blogger+api+oauth+access+token', label: 'Search: How to get Blogger API Access Token' },
    tips: ['OAuth tokens expire after 1 hour - use refresh token for long-term use', 'Blog ID is the numeric ID in your Blogger dashboard URL'],
  },
  wordpress: {
    summary: 'Create a WordPress.com app to get OAuth credentials.',
    steps: [
      { text: 'Log in to WordPress.com', link: { url: 'https://wordpress.com/log-in', label: 'WordPress.com Login' } },
      { text: 'Go to the Developer Apps page', link: { url: 'https://developer.wordpress.com/apps/', label: 'WordPress Developer Apps' } },
      { text: 'Click "Create New Application"' },
      { text: 'Fill in app name ("GravitySEO"), description, website URL, and redirect URL (use http://localhost)' },
      { text: 'After creating, note your Client ID and Client Secret' },
      { text: 'Use the OAuth flow to get an access token - visit this URL in your browser (replace CLIENT_ID): https://public-api.wordpress.com/oauth2/authorize?client_id=CLIENT_ID&redirect_uri=http://localhost&response_type=token' },
      { text: 'After authorizing, copy the access_token from the redirect URL' },
      { text: 'For Site ID: Use your site domain (e.g., yoursite.wordpress.com)' },
    ],
    videoLink: { url: 'https://www.youtube.com/results?search_query=wordpress.com+rest+api+oauth+access+token', label: 'Search: WordPress.com API Access Token' },
    tips: ['Access tokens don\'t expire unless revoked', 'Site ID can be your domain name or the numeric site ID'],
  },
  hashnode: {
    summary: 'Generate a Personal Access Token from Hashnode settings.',
    steps: [
      { text: 'Log in to your Hashnode account', link: { url: 'https://hashnode.com/', label: 'Hashnode' } },
      { text: 'Click your profile avatar > Account Settings', link: { url: 'https://hashnode.com/settings/developer', label: 'Hashnode Developer Settings' } },
      { text: 'Go to the "Developer" tab' },
      { text: 'Click "Generate New Token" under Personal Access Tokens' },
      { text: 'Give it a name (e.g., "GravitySEO") and generate' },
      { text: 'Copy the token immediately (it won\'t be shown again!)' },
      { text: 'For Publication ID: Go to your blog dashboard > General settings, the Publication ID is shown there. Or check the URL: hashnode.com/YOUR_PUBLICATION_ID/dashboard' },
    ],
    videoLink: { url: 'https://www.youtube.com/results?search_query=hashnode+personal+access+token+api', label: 'Search: How to get Hashnode API Token' },
    tips: ['Save the token immediately - it cannot be viewed again after creation', 'Publication ID is visible in your blog dashboard URL'],
  },
  twitter: {
    summary: 'Create a Twitter Developer app and get all 4 keys from the Developer Portal.',
    steps: [
      { text: 'Sign up for a Twitter Developer account (Free tier available)', link: { url: 'https://developer.x.com/en/portal/petition/essential/basic-info', label: 'Twitter Developer Signup' } },
      { text: 'Go to the Developer Portal Dashboard', link: { url: 'https://developer.x.com/en/portal/dashboard', label: 'Twitter Developer Portal' } },
      { text: 'Create a new Project and App (or use the default one)' },
      { text: 'In your App settings, go to "Keys and Tokens" tab' },
      { text: 'Under "Consumer Keys": Generate (or regenerate) API Key and API Secret. Copy both.' },
      { text: 'Under "Authentication Tokens": Generate Access Token and Secret. Copy both.' },
      { text: 'Make sure your app has "Read and Write" permissions under User Authentication Settings' },
    ],
    videoLink: { url: 'https://www.youtube.com/results?search_query=twitter+api+keys+and+tokens+developer+portal+2024', label: 'Search: How to get Twitter API Keys' },
    tips: [
      'Free tier allows 500 tweets/month (1,500 with Basic plan)',
      'You need all 4 keys: API Key, API Secret, Access Token, Access Token Secret',
      'Make sure "Read and Write" permissions are enabled',
      'If posting fails with 403, regenerate all tokens after changing permissions',
    ],
  },
  facebook: {
    summary: 'Get a long-lived Page Access Token via Meta for Developers.',
    steps: [
      { text: 'Go to Meta for Developers and log in', link: { url: 'https://developers.facebook.com/', label: 'Meta for Developers' } },
      { text: 'Create a new App: My Apps > Create App > Business type', link: { url: 'https://developers.facebook.com/apps/create/', label: 'Create Facebook App' } },
      { text: 'Add "Facebook Login" and "Pages API" products to your app' },
      { text: 'Open the Graph API Explorer', link: { url: 'https://developers.facebook.com/tools/explorer/', label: 'Graph API Explorer' } },
      { text: 'Select your app from the dropdown at the top' },
      { text: 'Click "Generate Access Token" and grant pages_manage_posts and pages_read_engagement permissions' },
      { text: 'This gives you a short-lived User Token. To get a long-lived Page Token:' },
      { text: 'In the Explorer, query: /me/accounts - this lists your pages with their access tokens' },
      { text: 'Copy the Page Access Token for your page' },
      { text: 'Extend it: Use the Access Token Debugger to exchange for a long-lived token', link: { url: 'https://developers.facebook.com/tools/debug/accesstoken/', label: 'Access Token Debugger' } },
      { text: 'For Page ID: It\'s in the /me/accounts response, or go to your Page > About > Page ID' },
    ],
    videoLink: { url: 'https://www.youtube.com/results?search_query=facebook+page+access+token+long+lived+graph+api+2024', label: 'Search: How to get Facebook Page Access Token' },
    tips: [
      'Long-lived page tokens never expire (unless you change password or revoke)',
      'You must be an admin of the Facebook Page',
      'Required permissions: pages_manage_posts, pages_read_engagement',
    ],
  },
  instagram: {
    summary: 'Requires a Facebook Page linked to an Instagram Business/Creator account.',
    steps: [
      { text: 'First, convert your Instagram to a Business or Creator account (in Instagram app: Settings > Account > Switch to Professional Account)' },
      { text: 'Link your Instagram Business account to a Facebook Page (Instagram app: Settings > Account > Linked Accounts > Facebook)' },
      { text: 'Set up a Meta Developer App (same as Facebook - see Facebook guide above)', link: { url: 'https://developers.facebook.com/apps/', label: 'Meta Developer Apps' } },
      { text: 'Add "Instagram Graph API" product to your app' },
      { text: 'Open Graph API Explorer and generate a token with: instagram_basic, instagram_content_publish, pages_show_list permissions', link: { url: 'https://developers.facebook.com/tools/explorer/', label: 'Graph API Explorer' } },
      { text: 'To find your Business Account ID, query: /YOUR_PAGE_ID?fields=instagram_business_account' },
      { text: 'The response contains your Instagram Business Account ID' },
      { text: 'For Default Image URL: Upload a branded image somewhere public (e.g., your website) and use that URL. Instagram requires an image for every post.' },
    ],
    videoLink: { url: 'https://www.youtube.com/results?search_query=instagram+graph+api+content+publish+business+account+2024', label: 'Search: Instagram Graph API Publishing Setup' },
    tips: [
      'Instagram API only works with Business/Creator accounts (not personal)',
      'You need a Facebook Page linked to the Instagram account',
      'Same access token works for both Facebook and Instagram',
      'Instagram always requires an image - set the Default Image URL field',
    ],
  },
  linkedin: {
    summary: 'Create a LinkedIn app and use OAuth to get an access token.',
    steps: [
      { text: 'Go to LinkedIn Developers and create a new app', link: { url: 'https://www.linkedin.com/developers/apps/new', label: 'Create LinkedIn App' } },
      { text: 'Fill in App name ("GravitySEO"), your LinkedIn Page, and other details' },
      { text: 'After creating, go to the "Auth" tab to find your Client ID and Client Secret' },
      { text: 'Under "Products" tab, request access to "Share on LinkedIn" and "Sign In with LinkedIn using OpenID Connect"' },
      { text: 'Set redirect URL to http://localhost:3000/api/auth/linkedin/callback (or http://localhost)' },
      { text: 'To get an access token, visit this URL in browser (replace CLIENT_ID): https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=CLIENT_ID&redirect_uri=http://localhost&scope=openid%20profile%20w_member_social' },
      { text: 'After authorizing, you\'ll be redirected with a ?code= parameter. Exchange it for an access token using the Token endpoint' },
      { text: 'To get your Person URN: Make a GET request to https://api.linkedin.com/v2/userinfo with your token. Your sub field is your person ID. URN format: urn:li:person:YOUR_ID' },
    ],
    videoLink: { url: 'https://www.youtube.com/results?search_query=linkedin+api+oauth+access+token+share+posts+2024', label: 'Search: LinkedIn API Access Token Setup' },
    tips: [
      'LinkedIn access tokens expire every 60 days - you\'ll need to refresh them',
      'The "Share on LinkedIn" product must be approved before posting works',
      'Person URN format: urn:li:person:abc123',
      'Refresh tokens last 365 days and can generate new access tokens',
    ],
  },
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, Record<string, string>>>({})
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const fetchPlatforms = async () => {
    try {
      const res = await fetch('/api/platforms')
      const data = await res.json()
      if (data.success) {
        setPlatforms(data.data)
        const vals: Record<string, Record<string, string>> = {}
        data.data.forEach((p: PlatformConfig) => {
          vals[p.platform] = {}
        })
        setEditValues(vals)
      }
    } catch (err) {
      console.error('Failed to fetch platforms:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (platform: string, key: string, value: string) => {
    setEditValues((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [key]: value },
    }))
  }

  const savePlatform = async (platform: string, enabled: boolean) => {
    setSaving(platform)
    try {
      const credentials: Record<string, string> = {}
      const fields = PLATFORM_FIELDS[platform] || []
      for (const field of fields) {
        const val = editValues[platform]?.[field.key]
        if (val && val.trim()) {
          credentials[field.key] = val.trim()
        }
      }

      await fetch(`/api/platforms/${platform}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          ...(Object.keys(credentials).length > 0 ? { credentials } : {}),
        }),
      })
      fetchPlatforms()
    } catch (err) {
      console.error('Failed to save platform:', err)
    } finally {
      setSaving(null)
    }
  }

  const toggleGuide = (platform: string) => {
    setExpandedGuides((prev) => ({ ...prev, [platform]: !prev[platform] }))
  }

  if (loading) return <p className="text-muted-foreground">Loading platforms...</p>

  const blogPlatforms = platforms.filter((p) => !p.type || p.type === 'blog')
  const socialPlatforms = platforms.filter((p) => p.type === 'social')

  const renderPlatformCard = (p: PlatformConfig) => {
    const fields = PLATFORM_FIELDS[p.platform] || []
    const guide = CREDENTIAL_GUIDES[p.platform]
    const isGuideOpen = expandedGuides[p.platform] || false

    return (
      <Card key={p.platform}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {p.type === 'social' ? (
                <Share2 className="h-5 w-5" />
              ) : (
                <Settings2 className="h-5 w-5" />
              )}
              <div>
                <CardTitle className="text-lg">{p.displayName}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  {p.enabled && p.hasCredentials ? (
                    <><CheckCircle className="h-4 w-4 text-green-600" /> Configured & enabled</>
                  ) : p.hasCredentials ? (
                    <><XCircle className="h-4 w-4 text-yellow-600" /> Configured but disabled</>
                  ) : (
                    <><XCircle className="h-4 w-4 text-muted-foreground" /> Not configured</>
                  )}
                </CardDescription>
              </div>
            </div>
            <Badge variant={p.enabled ? 'success' : 'secondary'}>
              {p.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* How to get credentials guide */}
          {guide && (
            <div className="rounded-lg border bg-muted/30">
              <button
                onClick={() => toggleGuide(p.platform)}
                className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-muted/50 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-primary">
                  <HelpCircle className="h-4 w-4" />
                  How to get {p.displayName} credentials
                </span>
                {isGuideOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isGuideOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{guide.summary}</p>

                  <ol className="space-y-2 ml-1">
                    {guide.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">
                          {step.text}
                          {step.link && (
                            <a
                              href={step.link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 ml-1 text-primary hover:underline font-medium"
                            >
                              {step.link.label}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </span>
                      </li>
                    ))}
                  </ol>

                  {guide.tips && guide.tips.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-md px-3 py-2 mt-2">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Tips:</p>
                      <ul className="space-y-1">
                        {guide.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-blue-600 dark:text-blue-400 flex gap-2">
                            <span className="flex-shrink-0">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {guide.videoLink && (
                    <a
                      href={guide.videoLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium mt-1"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      {guide.videoLink.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-sm font-medium">{field.label}</label>
              <Input
                type={field.type}
                value={editValues[p.platform]?.[field.key] || ''}
                onChange={(e) => updateField(p.platform, field.key, e.target.value)}
                placeholder={p.hasCredentials ? '••••••••  (already set, enter new value to update)' : `Enter ${field.label}`}
              />
              <p className="text-xs text-muted-foreground">{field.help}</p>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => savePlatform(p.platform, true)}
              disabled={saving === p.platform}
            >
              {saving === p.platform ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save & Enable
            </Button>
            {p.enabled && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => savePlatform(p.platform, false)}
              >
                Disable
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure API credentials for blog publishing and social media sharing
        </p>
      </div>

      {/* Blog Publishing Platforms */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Blog Publishing Platforms</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Publish full blog posts with backlinks to scoreboat.com
        </p>
        <div className="grid gap-4">
          {blogPlatforms.map(renderPlatformCard)}
        </div>
      </div>

      {/* Social Media Platforms */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Social Media Platforms</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Share published blog post links on social media to drive traffic
        </p>
        <div className="grid gap-4">
          {socialPlatforms.map(renderPlatformCard)}
        </div>
      </div>
    </div>
  )
}

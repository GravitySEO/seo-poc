import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export interface GeneratedImage {
  url: string
  alt: string
  credit?: {
    photographer: string
    photographerUrl: string
    pexelsUrl: string
  }
}

/**
 * Builds a ranked list of Pexels search queries from most specific to most generic,
 * so we always find a relevant image even for niche exam keywords.
 */
function buildSearchQueries(keyword: string, category: string): string[] {
  const cat = category.toLowerCase()
  return [
    `${keyword} exam preparation study India`,
    `${cat} exam student studying India`,
    `${cat} competitive exam preparation`,
    `student studying books exam preparation India`,
    `competitive exam preparation study desk`,
  ]
}

interface PexelsPhoto {
  id: number
  photographer: string
  photographer_url: string
  url: string
  alt: string
  src: {
    large2x: string
    large: string
    medium: string
  }
}

/**
 * Searches Pexels for a relevant image using the keyword and category.
 * Tries progressively broader queries until an image is found.
 * Returns null gracefully if no API key is set or all queries fail.
 */
export async function generateBlogImage(
  title: string,
  keyword: string,
  category: string
): Promise<GeneratedImage | null> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    console.log('[Image] PEXELS_API_KEY not set — skipping image')
    return null
  }

  const queries = buildSearchQueries(keyword, category)

  for (const query of queries) {
    try {
      const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`
      const res = await fetch(url, {
        headers: { Authorization: apiKey },
        signal: AbortSignal.timeout(8000),
      })

      if (!res.ok) {
        console.warn(`[Image] Pexels API error ${res.status} for query: "${query}"`)
        continue
      }

      const data = (await res.json()) as { photos: PexelsPhoto[] }
      if (!data.photos?.length) continue

      // Pick a random photo from the top 5 results for variety
      const photo = data.photos[Math.floor(Math.random() * data.photos.length)]

      console.log(`[Image] Found Pexels photo id=${photo.id} for query: "${query}"`)

      return {
        url: photo.src.large2x || photo.src.large,
        alt: photo.alt || `${title} — ${category} exam preparation`,
        credit: {
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
          pexelsUrl: photo.url,
        },
      }
    } catch (err) {
      console.warn(`[Image] Query failed: "${query}"`, err)
    }
  }

  console.warn('[Image] All Pexels queries exhausted — no image found')
  return null
}

/**
 * Downloads a Pexels image and saves it locally to /public/generated-images/.
 * Call this only if you need a local copy (e.g. for platforms that require hosted images).
 */
export async function downloadAndSaveImage(
  imageUrl: string,
  slug: string
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) return null

    const buffer = Buffer.from(await res.arrayBuffer())
    const ext = imageUrl.includes('.jpg') || imageUrl.includes('jpeg') ? 'jpg' : 'jpg'
    const filename = `${Date.now()}-${slug.slice(0, 40)}.${ext}`
    const dir = join(process.cwd(), 'public', 'generated-images')

    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, filename), buffer)

    return `/generated-images/${filename}`
  } catch (err) {
    console.error('[Image] Download failed:', err)
    return null
  }
}

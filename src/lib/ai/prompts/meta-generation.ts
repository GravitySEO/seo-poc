export function getMetaGenerationPrompt(
  title: string,
  keyword: string,
  excerpt: string
): { system: string; user: string } {
  return {
    system: `You are an SEO specialist. Generate optimized meta tags for blog posts. Return your response as a valid JSON object.

IMPORTANT: Return your response as a valid JSON object with this structure:
{
  "metaTitle": "50-60 characters, include keyword",
  "metaDescription": "150-160 characters, include keyword, compelling",
  "ogTitle": "Same as metaTitle or slightly different for social",
  "ogDescription": "Slightly longer, optimized for social sharing"
}`,
    user: `Generate SEO metadata for this blog post:

Title: "${title}"
Target keyword: "${keyword}"
Excerpt: "${excerpt}"

Requirements:
- Meta title: 50-60 characters, must include "${keyword}", compelling for search results
- Meta description: 150-160 characters, must include "${keyword}", should entice clicks
- OG title: Optimized for social media sharing
- OG description: Slightly more engaging for social media

The post is about competitive exam preparation for Indian students, published on scoreboat.com.`,
  }
}

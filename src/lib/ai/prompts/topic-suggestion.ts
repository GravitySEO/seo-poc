export function getTopicSuggestionPrompt(
  keyword: string,
  category: string
): { system: string; user: string } {
  return {
    system: `You are a content strategist for scoreboat.com, an Indian competitive exam preparation website. Your job is to create compelling blog post titles that will rank well on Google and attract students preparing for competitive exams.

IMPORTANT: Return your response as a valid JSON object with this structure:
{
  "topics": [
    {
      "title": "The blog post title (50-60 characters)",
      "description": "Brief description of what the post will cover",
      "secondaryKeywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}`,
    user: `For the keyword "${keyword}" in the "${category}" exam category, suggest 5 unique blog post titles that would:
1. Rank well on Google for this keyword
2. Be click-worthy for students preparing for ${category} exams
3. Include the keyword naturally
4. Be between 50-70 characters
5. Target the search intent of exam aspirants

Also suggest 3-5 secondary keywords for each topic that should be included in the blog post.`,
  }
}

// Simple regex extractor for download URLs (S3 buckets / static routes)
export function extractDownloadLinks(content: string): { url: string; ext: string }[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = content.match(urlRegex)
  if (!matches) return []

  return matches
    .map((url) => {
      // clean trailing punctuation if any
      const cleanedUrl = url.replace(/[.,;:)\]]$/, "")
      const lower = cleanedUrl.toLowerCase()
      let ext = "file"
      if (lower.includes(".pdf")) ext = "pdf"
      else if (lower.includes(".pptx")) ext = "pptx"
      else if (lower.includes(".docx")) ext = "docx"
      else if (lower.includes(".xlsx")) ext = "xlsx"
      else if (lower.includes(".png") || lower.includes(".jpg") || lower.includes(".jpeg")) ext = "img"
      
      return { url: cleanedUrl, ext }
    })
    .filter((item) => item.ext === "pdf" || item.ext === "pptx") // Priority focus on generated assets
}

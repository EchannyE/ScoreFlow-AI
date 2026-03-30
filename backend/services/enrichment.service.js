import Submission   from '../models/Submissions.js'
import { callClaude } from './claude.service.js'
 
export async function triggerAIEnrichment(submissionId) {
  const sub = await Submission.findById(submissionId).lean()
  if (!sub) return
 
  const description = sub.fields?.description ?? sub.title
 
  const summaryPrompt = `
Summarise this project submission in 2–3 sentences.
Focus on what it does, the problem it solves, and its potential impact.
Title: ${sub.title}
Track: ${sub.track}
Description: ${description}
`.trim()
 
  const scorePrompt = `
Rate this project 0–100 across:
  Innovation 25%  Feasibility 30%  Impact 25%  Presentation 20%
Return ONLY valid JSON with no extra text: {"score": 82, "category": "AI/ML"}
Title: ${sub.title}
Description: ${description}
`.trim()
 
  try {
    const [summaryText, scoreText] = await Promise.all([
      callClaude(summaryPrompt),
      callClaude(scorePrompt, 100),
    ])
 
    let suggestedScore = 70
    let category       = sub.track
    try {
      const parsed = JSON.parse(scoreText.match(/{[^}]+}/)?.[0] ?? '{}')
      suggestedScore = parsed.score    ?? 70
      category       = parsed.category ?? sub.track
    } catch { /* keep defaults */ }
 
    await Submission.findByIdAndUpdate(submissionId, {
      ai: {
        summary:        summaryText.trim(),
        category,
        suggestedScore,
        qualityFlag:    suggestedScore < 40,
        processedAt:    new Date(),
      },
    })
  } catch (err) {
    console.error('AI enrichment failed:', err.message)
  }
}
 
 
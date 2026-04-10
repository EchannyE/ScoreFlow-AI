import Submission from '../models/Submissions.js'
import { callClaude } from './claude.service.js'

// ================================
// 📌 AI ENRICHMENT PIPELINE
// ================================
export async function triggerAIEnrichment(submissionId) {
  await Submission.findByIdAndUpdate(submissionId, {
    aiStatus: 'processing',
  })

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
Rate this project from 0–100 across:
Innovation (25%), Feasibility (30%), Impact (25%), Presentation (20%).

Return STRICT JSON ONLY:
{
  "score": number,
  "category": "string",
  "confidence": number
}

Title: ${sub.title}
Description: ${description}
`.trim()

  try {
    const [summaryText, scoreText] = await Promise.all([
      callClaude(summaryPrompt),
      callClaude(scorePrompt, 150),
    ])

    let parsed = {}

    try {
      const jsonMatch = scoreText.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch?.[0] || '{}')
    } catch (e) {
      console.warn('AI JSON parse failed:', e.message)
    }

    const parsedScore = Number(parsed.score)
    const parsedConfidence = Number(parsed.confidence)

    const suggestedScore = Number.isFinite(parsedScore) ? parsedScore : 70
    const category =
      typeof parsed.category === 'string' && parsed.category.trim()
        ? parsed.category.trim()
        : sub.track
    const confidence = Number.isFinite(parsedConfidence) ? parsedConfidence : 0.6

    const qualityFlag = suggestedScore < 40
    const priority =
      suggestedScore > 80 ? 'high' :
      suggestedScore > 50 ? 'medium' :
      'low'

    await Submission.findByIdAndUpdate(submissionId, {
      ai: {
        summary: summaryText.trim(),
        category,
        suggestedScore,
        confidence,
        priority,
        qualityFlag,
        processedAt: new Date(),
      },
      aiStatus: 'completed',
    })
  } catch (err) {
    console.error('AI enrichment failed:', err.message)

    await Submission.findByIdAndUpdate(submissionId, {
      aiStatus: 'failed',
    })
  }
}

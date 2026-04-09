import Submission from '../models/Submissions.js'
import { callClaude } from './claude.service.js'

// ================================
// 📌 AI ENRICHMENT PIPELINE
// ================================
export async function triggerAIEnrichment(submissionId) {
  // Mark as processing
  await Submission.findByIdAndUpdate(submissionId, {
    aiStatus: 'processing'
  })

  const sub = await Submission.findById(submissionId).lean()
  if (!sub) return

  const description = sub.fields?.description ?? sub.title

  // =========================
  // 🧠 PROMPTS
  // =========================
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
  "confidence": number (0-1)
}

Title: ${sub.title}
Description: ${description}
`.trim()

  try {
    const [summaryText, scoreText] = await Promise.all([
      callClaude(summaryPrompt),
      callClaude(scorePrompt, 150),
    ])

    // =========================
    // 🔐 SAFE JSON PARSING
    // =========================
    let parsed = {}

    try {
      const jsonMatch = scoreText.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch?.[0] || '{}')
    } catch (e) {
      console.warn('AI JSON parse failed:', e.message)
    }

    const suggestedScore = Number(parsed.score) || 70
    const category       = parsed.category || sub.track
    const confidence     = Number(parsed.confidence) || 0.6

    // =========================
    // 🎯 QUALITY LOGIC
    // =========================
    const qualityFlag = suggestedScore < 40
    const priority =
      suggestedScore > 80 ? 'high' :
      suggestedScore > 50 ? 'medium' : 'low'

    // =========================
    // 💾 UPDATE SUBMISSION
    // =========================
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
      aiStatus: 'completed'
    })

  } catch (err) {
    console.error('AI enrichment failed:', err.message)

    await Submission.findByIdAndUpdate(submissionId, {
      aiStatus: 'failed'
    })
  }
}
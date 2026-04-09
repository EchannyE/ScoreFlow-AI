import Submission from '../models/Submissions.js'
import { callClaude } from './claude.service.js'

// ================================
// 📌 AI ENRICHMENT PIPELINE (v2)
// ================================
export async function triggerAIEnrichment(submissionId) {
  try {
    // =========================
    // 🔒 Prevent duplicate processing
    // =========================
    const existing = await Submission.findById(submissionId).lean()
    if (!existing) return

    if (existing.aiStatus === 'processing' || existing.aiStatus === 'completed') {
      return // already handled
    }

    // Mark as processing
    await Submission.findByIdAndUpdate(submissionId, {
      aiStatus: 'processing'
    })

    const description = existing.fields?.description ?? existing.title

    // =========================
    // 🧠 PROMPTS (tightened)
    // =========================
    const summaryPrompt = `
Summarise this project in 2–3 concise sentences.
Focus on functionality, problem solved, and impact.

Title: ${existing.title}
Track: ${existing.track}
Description: ${description}
`.trim()

    const scorePrompt = `
Evaluate this project.

Scoring:
- Innovation (25%)
- Feasibility (30%)
- Impact (25%)
- Presentation (20%)

Return STRICT JSON ONLY:
{
  "score": number (0-100),
  "category": "string",
  "confidence": number (0-1)
}

No explanations. No extra text.

Title: ${existing.title}
Description: ${description}
`.trim()

    // =========================
    // ⚡ PARALLEL AI CALLS
    // =========================
    const [summaryText, scoreText] = await Promise.all([
      callClaude(summaryPrompt),
      callClaude(scorePrompt, 150),
    ])

    // =========================
    // 🔐 ROBUST JSON PARSING
    // =========================
    let parsed = {}

    try {
      const jsonMatch = scoreText.match(/\{[\s\S]*?\}/) // non-greedy
      parsed = JSON.parse(jsonMatch?.[0] || '{}')
    } catch (e) {
      console.warn('AI JSON parse failed:', e.message)
    }

    // =========================
    // 🧮 SAFE VALUE NORMALIZATION
    // =========================
    let suggestedScore = Number(parsed.score)
    if (isNaN(suggestedScore)) suggestedScore = 70
    suggestedScore = Math.max(0, Math.min(100, suggestedScore))

    const category   = parsed.category || existing.track
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0.6))

    // =========================
    // 🎯 QUALITY + PRIORITY LOGIC
    // =========================
    const qualityFlag = suggestedScore < 40

    let priority = 'low'
    if (suggestedScore > 80) priority = 'high'
    else if (suggestedScore > 50) priority = 'medium'

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

    // =========================
    // 🔗 OPTIONAL: Trigger n8n
    // =========================
    if (process.env.N8N_ENRICHMENT_WEBHOOK) {
      fetch(process.env.N8N_ENRICHMENT_WEBHOOK, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      }).catch(() => {})
    }

  } catch (err) {
    console.error('AI enrichment failed:', err.message)

    await Submission.findByIdAndUpdate(submissionId, {
      aiStatus: 'failed'
    })
  }
}
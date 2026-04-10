import Submission from '../models/Submissions.js'
import { callClaude } from './claude.service.js'

// ================================
// 📌 AI ENRICHMENT PIPELINE
// ================================
export async function triggerAIEnrichment(submissionId) {
  try {
    // =========================
    // 🔒 Atomic lock to prevent duplicate processing
    // =========================
    const sub = await Submission.findOneAndUpdate(
      {
        _id: submissionId,
        aiStatus: { $nin: ['processing', 'completed'] },
      },
      {
        aiStatus: 'processing',
      },
      {
        new: true,
      }
    ).lean()

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

    const [summaryText, scoreText] = await Promise.all([
      callClaude(summaryPrompt),
      callClaude(scorePrompt, 150),
    ])

    let parsed = {}

    try {
      const jsonMatch = scoreText.match(/\{[\s\S]*?\}/)
      parsed = JSON.parse(jsonMatch?.[0] || '{}')
    } catch (e) {
      console.warn('AI JSON parse failed:', e.message)
    }

    const parsedScore = Number(parsed.score)
    const parsedConfidence = Number(parsed.confidence)

    const suggestedScore = Number.isFinite(parsedScore)
      ? Math.max(0, Math.min(100, parsedScore))
      : 70

    const category =
      typeof parsed.category === 'string' && parsed.category.trim()
        ? parsed.category.trim()
        : sub.track

    const confidence = Number.isFinite(parsedConfidence)
      ? Math.max(0, Math.min(1, parsedConfidence))
      : 0.6

    const qualityFlag = suggestedScore < 40

    const priority =
      suggestedScore > 80
        ? 'high'
        : suggestedScore > 50
          ? 'medium'
          : 'low'

    // Define "critical" for automation routing
    const critical =
      qualityFlag ||
      suggestedScore < 25 ||
      confidence < 0.35

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
      flagged: qualityFlag || critical,
      aiStatus: 'completed',
    })

    // =========================
    // 🔗 Trigger automation webhook
    // Submission Created
    // → Slack (if high priority)
    // → WhatsApp (if critical)
    // =========================
    if (process.env.N8N_ENRICHMENT_WEBHOOK) {
      fetch(process.env.N8N_ENRICHMENT_WEBHOOK, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          event: 'submission.enriched',
          submissionId: sub._id,
          title: sub.title,
          track: sub.track,
          submitterId: sub.submitterId,
          summary: summaryText.trim(),
          category,
          suggestedScore,
          confidence,
          priority,
          qualityFlag,
          critical,
          aiStatus: 'completed',
          processedAt: new Date().toISOString(),
        }),
      }).catch(err => {
        console.error('n8n enrichment webhook failed:', err.message)
      })
    }
  } catch (err) {
    console.error('AI enrichment failed:', err.message)

    await Submission.findByIdAndUpdate(submissionId, {
      aiStatus: 'failed',
    })

    // =========================
    // 🔗 Trigger error automation
    // Errors
    // → WhatsApp alert
    // =========================
    if (process.env.N8N_ERROR_WEBHOOK) {
      fetch(process.env.N8N_ERROR_WEBHOOK, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          event: 'system.error',
          source: 'AI enrichment',
          submissionId,
          message: err.message,
        }),
      }).catch(webhookErr => {
        console.error('n8n error webhook failed:', webhookErr.message)
      })
    }
  }
}

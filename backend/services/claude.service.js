const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

// ================================
// 📌 Claude API Wrapper (v2)
// ================================
export async function callClaude(prompt, maxTokens = 400, options = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is missing')
  }

  const {
    temperature = 0.3,
    retries = 2,
    timeoutMs = 15000,
  } = options

  let attempt = 0

  while (attempt <= retries) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-latest',
          max_tokens: maxTokens,
          temperature,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })

      clearTimeout(timeout)

      // =========================
      // ❌ Handle API errors
      // =========================
      if (!response.ok) {
        const errorText = await response.text()

        // Retry on rate limit / server errors
        if (response.status >= 500 || response.status === 429) {
          throw new Error(`Retryable error: ${response.status}`)
        }

        throw new Error(`Claude request failed: ${response.status} ${errorText}`)
      }

      const data = await response.json()

      // =========================
      // 🧠 Extract text safely
      // =========================
      const text = data.content
        ?.filter(part => part.type === 'text')
        .map(part => part.text)
        .join('\n')
        .trim()

      if (!text) {
        throw new Error('Empty response from Claude')
      }

      return text

    } catch (err) {
      attempt++

      // =========================
      // ❌ Abort / Timeout
      // =========================
      if (err.name === 'AbortError') {
        console.warn(`Claude timeout (attempt ${attempt})`)
      }

      // =========================
      // 🔁 Retry logic
      // =========================
      if (attempt > retries) {
        throw new Error(`Claude failed after ${retries + 1} attempts: ${err.message}`)
      }

      // exponential backoff
      await new Promise(res => setTimeout(res, 500 * attempt))
    }
  }
}
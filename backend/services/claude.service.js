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

  const model = process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-latest'

  let attempt = 0

  while (attempt <= retries) {
    let timeout

    try {
      const controller = new AbortController()
      timeout = setTimeout(() => controller.abort(), timeoutMs)

      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
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

      if (!response.ok) {
        const errorText = await response.text()

        if (response.status === 429 || response.status >= 500) {
          const retryableError = new Error(`Retryable error: ${response.status} ${errorText}`)
          retryableError.retryable = true
          throw retryableError
        }

        throw new Error(`Claude request failed: ${response.status} ${errorText}`)
      }

      const data = await response.json()

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
      clearTimeout(timeout)
      attempt++

      if (attempt > retries) {
        throw new Error(`Claude failed after ${retries + 1} attempts: ${err.message}`)
      }

      if (err.name === 'AbortError') {
        console.warn(`Claude timeout (attempt ${attempt}/${retries + 1})`)
      } else {
        console.warn(`Claude request failed (attempt ${attempt}/${retries + 1}): ${err.message}`)
      }

      await new Promise(resolve => setTimeout(resolve, 500 * attempt))
    }
  }
    }

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

export async function callClaude(prompt, maxTokens = 400) {
	const apiKey = process.env.ANTHROPIC_API_KEY
	if (!apiKey) {
		throw new Error('ANTHROPIC_API_KEY is missing')
	}

	const response = await fetch(CLAUDE_API_URL, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01',
		},
		body: JSON.stringify({
			model: process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-latest',
			max_tokens: maxTokens,
			messages: [{ role: 'user', content: prompt }],
		}),
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new Error(`Claude request failed: ${response.status} ${errorText}`)
	}

	const data = await response.json()
	return data.content
		?.filter(part => part.type === 'text')
		.map(part => part.text)
		.join('\n')
		.trim() ?? ''
}

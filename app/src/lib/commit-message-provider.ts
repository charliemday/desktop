import { API } from './api'
import { request } from './http'
import type { IBYOKCommitMessageConfig } from './byok-commit-message-config'

/** Commit details (title and description) returned by commit message generation */
export interface ICommitMessageResult {
  readonly title: string
  readonly description: string
}

/** Configuration for the Copilot provider */
export interface ICopilotProviderConfig {
  readonly provider: 'copilot'
  readonly api: API
}

/** Configuration for the BYOK provider */
export interface IBYOKProviderConfig {
  readonly provider: 'byok'
  readonly config: IBYOKCommitMessageConfig
}

export type CommitMessageProviderConfig =
  | ICopilotProviderConfig
  | IBYOKProviderConfig

const BYOK_SYSTEM_PROMPT = `You are a helpful assistant that generates git commit messages. Given a git diff, you must respond with a JSON object containing exactly two keys:
- "title": A short, imperative summary of the changes (max 72 characters, no period at end)
- "description": An optional longer description explaining what and why (can be empty string)

Respond only with valid JSON, no other text.`

/**
 * Generate a commit message using the configured provider (Copilot or BYOK).
 */
export async function getCommitMessage(
  diff: string,
  providerConfig: CommitMessageProviderConfig
): Promise<ICommitMessageResult> {
  if (providerConfig.provider === 'copilot') {
    return providerConfig.api.getDiffChangesCommitMessage(diff)
  }

  return getCommitMessageFromBYOK(diff, providerConfig.config)
}

/**
 * Validate endpoint URL to prevent SSRF. Allows localhost, 127.0.0.1, and https.
 */
function isEndpointUrlAllowed(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'https:') return true
    if (parsed.protocol !== 'http:') return false
    const host = parsed.hostname.toLowerCase()
    return (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.localhost')
    )
  } catch {
    return false
  }
}

/**
 * Generate a commit message using an OpenAI-compatible API (Ollama, LM Studio, etc.)
 */
async function getCommitMessageFromBYOK(
  diff: string,
  config: IBYOKCommitMessageConfig
): Promise<ICommitMessageResult> {
  const endpoint = config.endpoint.trim().replace(/\/$/, '')
  if (!isEndpointUrlAllowed(endpoint)) {
    throw new Error(
      'BYOK endpoint must be https or localhost (http://localhost, http://127.0.0.1)'
    )
  }
  const path = 'chat/completions'

  const token = config.apiKey ?? 'ollama' // Ollama requires a key but ignores it

  const response = await request(
    endpoint,
    token,
    'POST',
    path,
    {
      model: config.model,
      messages: [
        { role: 'system', content: BYOK_SYSTEM_PROMPT },
        { role: 'user', content: diff },
      ],
      stream: false,
      response_format: { type: 'json_object' },
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `BYOK commit message generation failed: ${response.status} ${response.statusText}. ${text}`
    )
  }

  const json = await response.json()
  const content =
    json.choices?.[0]?.message?.content ?? json.message?.content

  if (!content) {
    throw new Error('No content in BYOK response')
  }

  let parsed: { title?: string; description?: string }
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error('Invalid JSON in BYOK response')
  }

  const title = typeof parsed.title === 'string' ? parsed.title : ''
  const description =
    typeof parsed.description === 'string' ? parsed.description : ''

  if (!title && !description) {
    throw new Error('BYOK response missing title and description')
  }

  return {
    title: title || '(no title)',
    description: description || '',
  }
}

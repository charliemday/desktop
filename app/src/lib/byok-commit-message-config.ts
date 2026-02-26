import { getEnum } from './local-storage'
import { TokenStore } from './stores/token-store'

/** Provider for commit message generation */
export type CommitMessageProvider = 'copilot' | 'byok'

/** Configuration for BYOK (Bring Your Own Key) commit message generation */
export interface IBYOKCommitMessageConfig {
  readonly endpoint: string
  readonly model: string
  readonly apiKey?: string
}

const commitMessageProviderKey = 'commit-message-provider'
const byokEndpointKey = 'byok-commit-message-endpoint'
const byokModelKey = 'byok-commit-message-model'
const byokApiKeyTokenStoreKey = 'github-desktop-byok-commit-message-api-key'
const byokApiKeyLogin = 'byok'

const CommitMessageProviderEnum: Record<string, CommitMessageProvider> = {
  copilot: 'copilot',
  byok: 'byok',
}

/** Default provider when none is configured */
export const defaultCommitMessageProvider: CommitMessageProvider = 'copilot'

/** Get the selected commit message provider */
export function getCommitMessageProvider(): CommitMessageProvider {
  return (
    getEnum(commitMessageProviderKey, CommitMessageProviderEnum) ??
    defaultCommitMessageProvider
  )
}

/** Set the selected commit message provider */
export function setCommitMessageProvider(provider: CommitMessageProvider): void {
  localStorage.setItem(commitMessageProviderKey, provider)
}

/** Get the BYOK endpoint URL from storage */
export function getBYOKEndpoint(): string {
  return localStorage.getItem(byokEndpointKey) ?? ''
}

/** Set the BYOK endpoint URL */
export function setBYOKEndpoint(endpoint: string): void {
  localStorage.setItem(byokEndpointKey, endpoint)
}

/** Get the BYOK model name from storage */
export function getBYOKModel(): string {
  return localStorage.getItem(byokModelKey) ?? ''
}

/** Set the BYOK model name */
export function setBYOKModel(model: string): void {
  localStorage.setItem(byokModelKey, model)
}

/** Get the BYOK API key from secure storage (async) */
export function getBYOKApiKey(): Promise<string | null> {
  return TokenStore.getItem(byokApiKeyTokenStoreKey, byokApiKeyLogin)
}

/** Set the BYOK API key in secure storage */
export function setBYOKApiKey(apiKey: string): Promise<void> {
  return TokenStore.setItem(byokApiKeyTokenStoreKey, byokApiKeyLogin, apiKey)
}

/** Clear the BYOK API key from secure storage */
export function clearBYOKApiKey(): Promise<void> {
  return TokenStore.deleteItem(
    byokApiKeyTokenStoreKey,
    byokApiKeyLogin
  ).then(() => {})
}

/** Get the full BYOK config including API key (async) */
export async function getBYOKConfig(): Promise<IBYOKCommitMessageConfig> {
  const endpoint = getBYOKEndpoint()
  const model = getBYOKModel()
  const apiKey = await getBYOKApiKey()
  return {
    endpoint,
    model,
    ...(apiKey ? { apiKey } : {}),
  }
}

/** Check if BYOK config is valid (has required endpoint and model) */
export function isBYOKConfigValid(config: IBYOKCommitMessageConfig): boolean {
  return config.endpoint.trim() !== '' && config.model.trim() !== ''
}

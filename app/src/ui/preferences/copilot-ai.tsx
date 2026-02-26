import * as React from 'react'
import { DialogContent } from '../dialog'
import { RadioGroup } from '../lib/radio-group'
import { TextBox } from '../lib/text-box'
import { PasswordTextBox } from '../lib/password-text-box'
import { LinkButton } from '../lib/link-button'
import type { CommitMessageProvider } from '../../lib/byok-commit-message-config'

interface ICopilotAIPreferencesProps {
  readonly commitMessageProvider: CommitMessageProvider
  readonly byokEndpoint: string
  readonly byokModel: string
  readonly byokApiKey: string
  readonly hasCopilotAccount: boolean
  readonly onCommitMessageProviderChanged: (provider: CommitMessageProvider) => void
  readonly onBYOKEndpointChanged: (endpoint: string) => void
  readonly onBYOKModelChanged: (model: string) => void
  readonly onBYOKApiKeyChanged: (apiKey: string) => void
}

export class CopilotAI extends React.Component<ICopilotAIPreferencesProps> {
  private onProviderChanged = (provider: CommitMessageProvider) => {
    this.props.onCommitMessageProviderChanged(provider)
  }

  private onEndpointChanged = (value: string) => {
    this.props.onBYOKEndpointChanged(value)
  }

  private onModelChanged = (value: string) => {
    this.props.onBYOKModelChanged(value)
  }

  private onApiKeyChanged = (value: string) => {
    this.props.onBYOKApiKeyChanged(value)
  }

  private renderProviderLabel = (key: CommitMessageProvider) => {
    switch (key) {
      case 'copilot':
        return this.props.hasCopilotAccount
          ? 'GitHub Copilot (requires Copilot license)'
          : 'GitHub Copilot (no Copilot license - sign in with a licensed account)'
      case 'byok':
        return 'Custom (BYOK) - Ollama, LM Studio, or OpenAI-compatible API'
      default:
        return key
    }
  }

  public render() {
    const {
      commitMessageProvider,
      byokEndpoint,
      byokModel,
      byokApiKey,
    } = this.props

    return (
      <DialogContent>
        <div className="advanced-section">
          <h2 id="commit-message-provider-heading">
            Commit message generation
          </h2>
          <p className="git-settings-description">
            Choose how to generate commit messages from your changes.
          </p>
          <RadioGroup<CommitMessageProvider>
            ariaLabelledBy="commit-message-provider-heading"
            selectedKey={commitMessageProvider}
            radioButtonKeys={['copilot', 'byok']}
            onSelectionChanged={this.onProviderChanged}
            renderRadioButtonLabelContents={this.renderProviderLabel}
          />
        </div>

        {commitMessageProvider === 'byok' && (
          <div className="advanced-section byok-config-section">
            <h2>Custom (BYOK) configuration</h2>
            <p className="git-settings-description">
              Use a local or cloud OpenAI-compatible API (e.g.{' '}
              <LinkButton uri="https://ollama.com">Ollama</LinkButton>,{' '}
              <LinkButton uri="https://lmstudio.ai">LM Studio</LinkButton>).
              Endpoint must be https or localhost.
            </p>
            <div className="byok-config-field">
              <TextBox
                label="Base URL"
                value={byokEndpoint}
                onValueChanged={this.onEndpointChanged}
                placeholder="http://localhost:11434/v1"
                ariaDescribedBy="byok-endpoint-description"
              />
              <div
                id="byok-endpoint-description"
                className="git-settings-description"
              >
                <p>
                  The Base URL is the address of your model server. GitHub
                  Desktop sends the diff to this endpoint to get a suggested
                  commit message. Each tool uses a different URL.
                </p>
                <p>
                  For Ollama: <code>http://localhost:11434/v1</code>
                </p>
              </div>
            </div>
            <div className="byok-config-field">
              <TextBox
                label="Model"
                value={byokModel}
                onValueChanged={this.onModelChanged}
                placeholder="codellama"
                ariaDescribedBy="byok-model-description"
              />
              <div
                id="byok-model-description"
                className="git-settings-description"
              >
                <p>
                  Model name (e.g. <code>codellama</code>, <code>llama2</code>).
                  For Ollama, run <code>ollama pull codellama</code> first.
                </p>
              </div>
            </div>
            <div className="byok-config-field">
              <PasswordTextBox
                label="API key (optional)"
                value={byokApiKey}
                onValueChanged={this.onApiKeyChanged}
                placeholder="Leave blank for local models (Ollama)"
                ariaDescribedBy="byok-apikey-description"
              />
              <div
                id="byok-apikey-description"
                className="git-settings-description"
              >
                <p>
                  Required for cloud providers (OpenAI, etc.). Leave blank for
                  local models like Ollama.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    )
  }
}

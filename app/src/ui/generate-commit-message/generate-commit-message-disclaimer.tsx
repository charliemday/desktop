import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  OkCancelButtonGroup,
} from '../dialog'
import { Dispatcher } from '../dispatcher'
import { Repository } from '../../models/repository'
import { WorkingDirectoryFileChange } from '../../models/status'
import { LinkButton } from '../lib/link-button'
import { getCommitMessageProvider } from '../../lib/byok-commit-message-config'

interface IGenerateCommitMessageDisclaimerProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly filesSelected: ReadonlyArray<WorkingDirectoryFileChange>

  /**
   * Callback to use when the dialog gets closed.
   */
  readonly onDismissed: () => void
}

export class GenerateCommitMessageDisclaimer extends React.Component<IGenerateCommitMessageDisclaimerProps> {
  public constructor(props: IGenerateCommitMessageDisclaimerProps) {
    super(props)
  }

  public render() {
    const provider = getCommitMessageProvider()
    const isCopilot = provider === 'copilot'

    return (
      <Dialog
        title={isCopilot ? 'GitHub Copilot' : 'AI-generated commit message'}
        id="generate-commit-message-disclaimer"
        type="warning"
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
        ariaDescribedBy="generate-commit-message-disclaimer-body"
        role="alertdialog"
      >
        <DialogContent>
          <p id="generate-commit-message-disclaimer-body">
            {isCopilot ? (
              <>
                Copilot is powered by AI, so mistakes are possible. Review and
                edit the generated message carefully before use.{' '}
                <LinkButton uri="https://gh.io/copilot-for-desktop-transparency">
                  Learn more about Copilot in GitHub Desktop.
                </LinkButton>
              </>
            ) : (
              <>
                AI-generated messages may contain mistakes. Review and edit the
                generated message carefully before use.
              </>
            )}
          </p>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup destructive={true} okButtonText="I understand" />
        </DialogFooter>
      </Dialog>
    )
  }

  private onSubmit = async () => {
    this.props.dispatcher.updateCommitMessageGenerationDisclaimerLastSeen()
    this.props.dispatcher.generateCommitMessage(
      this.props.repository,
      this.props.filesSelected
    )
    this.props.onDismissed()
  }
}

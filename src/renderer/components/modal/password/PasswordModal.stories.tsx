import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import * as Rx from 'rxjs'

import { mockValidatePassword$ } from '../../../../shared/mock/wallet'
import { ValidatePasswordHandler } from '../../../services/wallet/types'
import { PasswordModal } from './PasswordModal'

const onClose = () => console.log('onClose')
const onSuccess = () => console.log('onSuccess')
const validatePasswordInitial$: ValidatePasswordHandler = (_) => Rx.of(RD.initial)
const validatePasswordPending$: ValidatePasswordHandler = (_) => Rx.of(RD.pending)
const validatePasswordFailure$: ValidatePasswordHandler = (_) => Rx.of(RD.failure(Error('invalid password')))
const validatePasswordSuccess$: ValidatePasswordHandler = (_) => Rx.of(RD.success(undefined))

export const StoryInitial: Story = () => (
  <PasswordModal onClose={onClose} onSuccess={onSuccess} validatePassword$={validatePasswordInitial$} />
)
StoryInitial.storyName = 'initial'

export const StorySuccess: Story = () => (
  <PasswordModal onClose={onClose} onSuccess={onSuccess} validatePassword$={validatePasswordSuccess$} />
)
StorySuccess.storyName = 'success'

export const StoryValidating: Story = () => (
  <PasswordModal onClose={onClose} onSuccess={onSuccess} validatePassword$={validatePasswordPending$} />
)
StoryValidating.storyName = 'validating'

export const StoryInvalid: Story = () => (
  <PasswordModal onClose={onClose} onSuccess={onSuccess} validatePassword$={validatePasswordFailure$} />
)
StoryInvalid.storyName = 'invalid'

// Story to enter password "123" and check validation by clicking confirm button.
// Open Browser's console to see log outputs
export const StoryCheck: Story = () => (
  <PasswordModal onClose={onClose} onSuccess={onSuccess} validatePassword$={mockValidatePassword$} />
)
StoryCheck.storyName = 'check'

const meta: Meta = {
  component: PasswordModal,
  title: 'Components/Modal/Password',
  decorators: [
    (S: Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '300px'
        }}>
        <S />
      </div>
    )
  ]
}

export default meta

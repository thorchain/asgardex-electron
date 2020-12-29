import React from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Story, Meta } from '@storybook/react'
import * as Rx from 'rxjs'

import { ValidatePasswordHandler } from '../../../services/wallet/types'
import { PasswordModal } from './PasswordModal'

const onClose = () => console.log('onClose')
const onSuccess = () => console.log('onCSuccess')
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

const meta: Meta = {
  component: PasswordModal,
  title: 'Components/Password Modal',
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

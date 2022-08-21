import * as RD from '@devexperts/remote-data-ts'
import { ComponentMeta } from '@storybook/react'
import { Chain } from '@xchainjs/xchain-util'
import * as Rx from 'rxjs'

import { mockValidatePassword$ } from '../../../../shared/mock/wallet'
import { WalletPasswordConfirmationModal } from './WalletPasswordConfirmationModal'

type ValidatePasswordVariant = 'initial' | 'pending' | 'failure' | 'success' | 'all'
type Args = {
  chain: Chain
  validatePwVariant: ValidatePasswordVariant
}

const validatePasswordRD = (variants: 'initial' | 'pending' | 'failure' | 'success'): RD.RemoteData<Error, void> => {
  switch (variants) {
    case 'initial':
      return RD.initial
    case 'pending':
      return RD.pending
    case 'failure':
      return RD.failure(Error('invalid password'))
    case 'success':
      return RD.success(undefined)
    default:
      return RD.initial
  }
}
const Template = ({ validatePwVariant }: Args) => {
  return (
    <WalletPasswordConfirmationModal
      onClose={() => console.log('onClose')}
      onSuccess={() => console.log('onSuccess')}
      validatePassword$={
        // 'all' -> enter password "123" and check validation by clicking confirm button.
        // Open Browser's console to see log outputs
        validatePwVariant === 'all' ? mockValidatePassword$ : (_) => Rx.of(validatePasswordRD(validatePwVariant))
      }
    />
  )
}

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Modal/WalletPasswordConfirmation',
  argTypes: {
    validatePwVariant: {
      name: 'validatePasswordVariant',
      control: {
        type: 'select',
        options: ['initial', 'pending', 'failure', 'success', 'all']
      },
      defaultValue: 'all'
    }
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '300px'
        }}>
        <Story />
      </div>
    )
  ]
}

export default meta

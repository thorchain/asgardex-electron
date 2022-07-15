import { Story, Meta } from '@storybook/react'
import {
  assetAmount,
  AssetBNB,
  AssetRuneNative,
  assetToBase,
  BaseAmount,
  formatBaseAmount
} from '@xchainjs/xchain-util'

import { MaxBalanceButton, Props } from './MaxBalanceButton'

const defaultProps: Props = {
  balance: {
    asset: AssetBNB,
    amount: assetToBase(assetAmount(1001))
  },
  maxInfoText: '',
  onClick: (amount: BaseAmount) => console.log('amount', formatBaseAmount(amount))
}

export const Default: Story = () => <MaxBalanceButton {...defaultProps} />
Default.storyName = 'default - bnb'

export const Disabled: Story = () => {
  const props: Props = { ...defaultProps, disabled: true }
  return <MaxBalanceButton {...props} />
}
Disabled.storyName = 'disabled'

export const Rune: Story = () => {
  const props: Props = {
    ...defaultProps,
    balance: {
      asset: AssetRuneNative,
      amount: assetToBase(assetAmount(2002))
    }
  }
  return <MaxBalanceButton {...props} />
}
Rune.storyName = 'rune'

const meta: Meta = {
  component: MaxBalanceButton,
  title: 'Components/button/MaxBalanceButton',
  decorators: [
    (S) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
        <S />
      </div>
    )
  ]
}

export default meta

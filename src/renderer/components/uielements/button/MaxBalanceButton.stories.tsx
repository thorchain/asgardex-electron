import { StoryFn, ComponentMeta } from '@storybook/react'
import { Balance } from '@xchainjs/xchain-client'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'

import { MaxBalanceButton as Component, ComponentProps } from './MaxBalanceButton'

const Template: StoryFn<ComponentProps> = (args) => <Component {...args} />
export const Default = Template.bind({})

const bnbBalance: Balance = {
  asset: AssetBNB,
  amount: assetToBase(assetAmount(123))
}

const meta: ComponentMeta<typeof Component> = {
  component: Component,
  title: 'Components/button/MaxBalanceButton',
  argTypes: {
    balance: {
      options: ['BNB', 'RUNE'],
      mappings: {
        BNB: bnbBalance,
        RUNE: {
          asset: AssetRuneNative,
          amount: assetToBase(assetAmount(345))
        }
      }
    },
    onClick: { action: 'onClick' }
  },
  args: {
    maxInfoText: 'info text',
    balance: bnbBalance
  },
  decorators: [
    (S) => (
      <div className="flex-column flex">
        <S />
      </div>
    )
  ]
}

export default meta

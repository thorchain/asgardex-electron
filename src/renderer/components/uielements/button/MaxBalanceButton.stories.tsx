import { ComponentMeta } from '@storybook/react'
import { Balance } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

import { AssetBNB, AssetRuneNative } from '../../../../shared/utils/asset'
import { MaxBalanceButton as Component, ComponentProps } from './MaxBalanceButton'

export const MaxBalanceButton = (props: ComponentProps) => <Component {...props} />

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
    balance: bnbBalance,
    hidePrivateData: false
  },
  decorators: [
    (S) => (
      <div className="flex h-screen items-center justify-center bg-white">
        <S />
      </div>
    )
  ]
}

export default meta

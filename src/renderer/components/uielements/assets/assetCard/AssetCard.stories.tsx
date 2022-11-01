import { ComponentMeta } from '@storybook/react'
import { bn, AssetBNB, assetAmount, assetToBase, AssetBTC, AssetRuneNative } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { BNB_ADDRESS_TESTNET } from '../../../../../shared/mock/address'
import { isWalletType } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import { ZERO_BASE_AMOUNT } from '../../../../const'
import { Color as InfoIconColor } from './../../info/InfoIcon'
import { AssetCard as Component, Props } from './AssetCard'

type Args = {
  tooltipColor: InfoIconColor
  tooltip: string
  walletTypeDisabled: boolean
  walletType: WalletType | 'none'
}

const Template = ({ walletTypeDisabled, tooltip, tooltipColor, walletType }: Args) => {
  const props: Props = {
    assetBalance: assetToBase(assetAmount(12)),
    asset: { asset: AssetBNB, address: BNB_ADDRESS_TESTNET },
    walletType: FP.pipe(walletType, O.fromPredicate(isWalletType)),
    walletTypeDisabled,
    walletTypeTooltip: tooltip,
    walletTypeTooltipColor: tooltipColor,
    onChangeWalletType: () => console.log('ledger'),
    assets: [AssetBNB, AssetBTC, AssetRuneNative],
    selectedAmount: ZERO_BASE_AMOUNT,
    onChangeAssetAmount: (value) => console.log('assetAmount', value),
    inputOnFocusHandler: () => console.log('onFocus'),
    inputOnBlurHandler: () => console.log('onBlur'),
    onChangePercent: (percent) => console.log('percent', percent),
    price: bn(600),
    percentValue: 55,
    maxAmount: assetToBase(assetAmount(10)),
    network: 'testnet'
  }

  return <Component {...props} />
}

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Assets/AssetCard',
  argTypes: {
    walletType: {
      control: {
        type: 'select',
        options: ['keystore', 'ledger', 'none']
      }
    },
    tooltipColor: {
      control: {
        type: 'select',
        options: ['primary', 'warning', 'error']
      }
    }
  },
  args: {
    walletTypeDisabled: false,
    tooltip: 'Tooltip example text',
    tooltipColor: 'primary',
    walletType: 'ledger'
  },
  decorators: [
    (S) => (
      <div style={{ display: 'flex', padding: '20px' }}>
        <S />
      </div>
    )
  ]
}

export default meta

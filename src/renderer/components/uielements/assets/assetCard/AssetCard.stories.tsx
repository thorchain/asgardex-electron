import React from 'react'

import { Meta, Story } from '@storybook/react'
import { bn, AssetBNB, assetAmount, assetToBase, AssetBTC, AssetRuneNative } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { BNB_ADDRESS_TESTNET } from '../../../../../shared/mock/address'
import { WalletType } from '../../../../../shared/wallet/types'
import { ZERO_BASE_AMOUNT } from '../../../../const'
import * as InfoIconStyled from './../../info/InfoIcon.styles'
import { AssetCard, Props as AssetCardProps } from './AssetCard'

type Args = {
  tooltipColor: InfoIconStyled.Color
  tooltip: string
  walletTypeDisabled: boolean
  walletType: WalletType & 'none'
}

export const Default: Story<Args> = ({ walletTypeDisabled, tooltip, tooltipColor, walletType }) => {
  const props: AssetCardProps = {
    assetBalance: assetToBase(assetAmount(12)),
    asset: { asset: AssetBNB, address: BNB_ADDRESS_TESTNET },
    walletType: FP.pipe(
      walletType,
      O.fromPredicate((value) => value !== 'none')
    ),
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

  return <AssetCard {...props} />
}

Default.storyName = 'default'

const meta: Meta<Args> = {
  component: AssetCard,
  title: 'Components/Assets/AssetCard',
  argTypes: {
    walletType: {
      control: {
        type: 'select',
        options: ['keystore', 'ledger', 'none']
      },
      defaultValue: 'keystore'
    },
    tooltipColor: {
      control: {
        type: 'select',
        options: ['primary', 'warning', 'error']
      },
      defaultValue: 'primary'
    },
    tooltip: {
      control: {
        type: 'text'
      },
      defaultValue: 'Tooltip example text'
    },
    walletTypeDisabled: {
      control: {
        type: 'boolean'
      },
      defaultValue: false
    }
  },
  decorators: [
    (S: Story) => (
      <div style={{ display: 'flex', padding: '20px' }}>
        <S />
      </div>
    )
  ]
}

export default meta

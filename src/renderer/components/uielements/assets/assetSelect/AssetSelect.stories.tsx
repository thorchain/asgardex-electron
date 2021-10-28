import React from 'react'

import { Meta, Story } from '@storybook/react'
import { AssetBNB, AssetBTC, bn } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../../../shared/api/types'
import { WalletType } from '../../../../../shared/wallet/types'
import { mockWalletBalance } from '../../../../helpers/test/testWalletHelper'
import { WalletBalance } from '../../../../services/wallet/types'
import { AssetSelect } from './AssetSelect'

const balanceBNB: WalletBalance = mockWalletBalance({
  walletType: 'ledger',
  asset: AssetBNB,
  walletAddress: 'bnb-ledger-address'
})

const balanceBTC: WalletBalance = mockWalletBalance({
  asset: AssetBTC,
  walletAddress: 'btc-address'
})

const balanceRuneNative: WalletBalance = mockWalletBalance()

const balances = [balanceBNB, balanceBTC, balanceRuneNative]

const priceIndex = {
  RUNE: bn(1),
  BNB: bn(2),
  BTC: bn(3)
}

type Args = {
  withSearch: boolean
  network: Network
  assetWalletType: WalletType
  onSelect: FP.Lazy<void>
}

const Template: Story<Args> = ({ network, withSearch, assetWalletType, onSelect }) => (
  <AssetSelect
    asset={AssetBNB}
    assetWalletType={assetWalletType}
    withSearch={withSearch}
    balances={balances}
    priceIndex={priceIndex}
    onSelect={onSelect}
    searchDisable={[]}
    network={network}
  />
)

export const Default = Template.bind({})

Default.storyName = 'default'

const meta: Meta = {
  component: AssetSelect,
  title: 'Components/Assets/AssetSelect',
  argTypes: {
    network: {
      name: 'Network',
      control: {
        type: 'select',
        options: ['mainnet', 'testnet']
      },
      defaultValue: 'mainnet'
    },
    withSearch: {
      name: 'with search',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    },
    assetWalletType: {
      name: 'asset wallet type',
      control: {
        type: 'select',
        options: ['ledger', 'keystore']
      },
      defaultValue: 'ledger'
    },
    onSelect: {
      action: 'onSelect'
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

import React from 'react'

import { Story, Meta } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'

import { Network } from '../../../../../shared/api/types'
import { WalletType } from '../../../../../shared/wallet/types'
import { AssetData } from './AssetData'
import { AssetDataSize } from './AssetData.styles'

type Args = {
  noTicker: boolean
  network: Network
  noPrice: boolean
  size: AssetDataSize
  walletType: WalletType & 'undefined'
}

const Template: Story<Args> = ({ network, size, noTicker, noPrice, walletType }) => {
  const amount = assetToBase(assetAmount(2.49274))
  const price = noPrice ? undefined : assetToBase(assetAmount(217.92))
  const priceAsset = noPrice ? undefined : AssetRuneNative
  const wType = walletType !== 'undefined' ? walletType : undefined

  return (
    <AssetData
      asset={AssetBNB}
      noTicker={noTicker}
      amount={amount}
      price={price}
      priceAsset={priceAsset}
      size={size}
      network={network}
      walletType={wType}
    />
  )
}

export const Default = Template.bind({})

Default.storyName = 'default'

const meta: Meta<Args> = {
  component: AssetData,
  title: 'Components/Assets/AssetData',
  argTypes: {
    network: {
      name: 'Network',
      control: {
        type: 'select',
        options: ['mainnet', 'testnet']
      },
      defaultValue: 'mainnet'
    },
    noTicker: {
      name: 'no ticker',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    },
    noPrice: {
      name: 'no price',
      control: {
        type: 'boolean'
      },
      defaultValue: true
    },
    size: {
      name: 'Size',
      control: {
        type: 'select',
        options: ['small', 'big']
      },
      defaultValue: 'small'
    },
    walletType: {
      name: 'wallet type',
      control: {
        type: 'select',
        options: ['ledger', 'keystore', 'undefined']
      },
      defaultValue: 'ledger'
    }
  },
  decorators: [
    (S: Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '500px'
        }}>
        <S />
      </div>
    )
  ]
}

export default meta

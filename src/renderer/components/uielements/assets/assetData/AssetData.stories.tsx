import { ComponentMeta } from '@storybook/react'
import { assetAmount, AssetBNB, AssetRuneNative, assetToBase } from '@xchainjs/xchain-util'

import { Network } from '../../../../../shared/api/types'
import { WalletType } from '../../../../../shared/wallet/types'
import * as AT from '../../../../storybook/argTypes'
import { AssetData } from './AssetData'
import { AssetDataSize } from './AssetData.styles'

type Args = {
  noTicker: boolean
  network: Network
  noPrice: boolean
  size: AssetDataSize
  walletType: WalletType | undefined
}

const Template = ({ network, size, noTicker, noPrice, walletType }: Args) => {
  const amount = assetToBase(assetAmount(2.49274))
  const price = noPrice ? undefined : assetToBase(assetAmount(217.92))
  const priceAsset = noPrice ? undefined : AssetRuneNative

  return (
    <AssetData
      asset={AssetBNB}
      noTicker={noTicker}
      amount={amount}
      price={price}
      priceAsset={priceAsset}
      size={size}
      network={network}
      walletType={walletType}
    />
  )
}

export const Default = Template.bind({})

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Assets/AssetData',
  argTypes: {
    network: AT.network,
    size: {
      name: 'Size',
      control: {
        type: 'select',
        options: ['small', 'big']
      }
    },
    walletType: {
      name: 'wallet type',
      control: {
        type: 'selection',
        options: ['ledger', 'keystore', 'undefined'],
        mapping: {
          ledger: 'ledger',
          keystore: 'keystore',
          undefined: undefined
        }
      }
    }
  },
  args: {
    network: 'mainnet',
    walletType: 'ledger',
    size: 'small',
    noPrice: true,
    noTicker: false
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '500px'
        }}>
        <Story />
      </div>
    )
  ]
}

export default meta

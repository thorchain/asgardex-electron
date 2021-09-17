import React from 'react'

import { Story, Meta } from '@storybook/react'
import { assetAmount, assetToBase, AssetBNB, AssetBTC } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../../shared/api/types'
import { AssetWithAmount1e8, AssetsWithAmount1e8 } from '../../../types/asgardex'
import { PendingAssets } from './Deposit.subcomponents'

const bnbAsset: AssetWithAmount1e8 = {
  amount1e8: assetToBase(assetAmount(1)),
  asset: AssetBNB
}

const btcAsset: AssetWithAmount1e8 = {
  asset: AssetBTC,
  amount1e8: assetToBase(assetAmount(2))
}

const assets: AssetsWithAmount1e8 = [bnbAsset, btcAsset]

type PendingAssetsStoryArgs = {
  network: Network
  onClickRecovery: FP.Lazy<void>
  loading: boolean
}

const PendingAssetsTemplate: Story<PendingAssetsStoryArgs> = ({ network, loading, onClickRecovery }) => {
  return <PendingAssets assets={assets} network={network} onClickRecovery={onClickRecovery} loading={loading} />
}

export const Default = PendingAssetsTemplate.bind({})

Default.storyName = 'default'

const metaPendingAssets: Meta<PendingAssetsStoryArgs> = {
  component: PendingAssets,
  title: 'Components/Deposit/PendingAssets',
  argTypes: {
    network: {
      name: 'Network',
      control: {
        type: 'select',
        options: ['mainnet', 'testnet']
      },
      defaultValue: 'mainnet'
    },
    loading: {
      name: 'Loading state',
      control: {
        type: 'boolean'
      },
      defaultValue: false
    },
    onClickRecovery: {
      action: 'onClickRecovery'
    }
  }
}

export default metaPendingAssets

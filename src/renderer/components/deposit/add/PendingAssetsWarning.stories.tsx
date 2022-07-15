import { ComponentMeta } from '@storybook/react'
import { assetAmount, assetToBase, AssetBNB, AssetBTC } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'

import { Network } from '../../../../shared/api/types'
import { AssetWithAmount1e8, AssetsWithAmount1e8 } from '../../../types/asgardex'
import { PendingAssetsWarning as Component } from './PendingAssetsWarning'

const bnbAsset: AssetWithAmount1e8 = {
  amount1e8: assetToBase(assetAmount(1)),
  asset: AssetBNB
}

const btcAsset: AssetWithAmount1e8 = {
  asset: AssetBTC,
  amount1e8: assetToBase(assetAmount(2))
}

const assets: AssetsWithAmount1e8 = [bnbAsset, btcAsset]

type Args = {
  network: Network
  onClickRecovery: FP.Lazy<void>
  loading: boolean
}

const Template = ({ network, loading, onClickRecovery }: Args) => {
  return <Component assets={assets} network={network} onClickRecovery={onClickRecovery} loading={loading} />
}

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Deposit/PendingAssets',
  argTypes: {
    network: {
      name: 'Network',
      options: ['mainnet', 'stagenet', 'testnet'],
      defaultValue: 'mainnet'
    },
    loading: {
      name: 'Loading state',
      control: 'boolean',
      defaultValue: false
    },
    onClickRecovery: {
      action: 'onClickRecovery'
    }
  }
}

export default meta

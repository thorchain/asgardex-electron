import { ComponentMeta } from '@storybook/react'
import { assetFromString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../../shared/api/types'
import { AsymAssetsWarning } from './AsymAssetsWarning'

type Args = {
  network: Network
  onClickOpenAsymTool: FP.Lazy<void>
  loading: boolean
  assets: string
}

const Template = ({ network, loading, onClickOpenAsymTool, assets }: Args) => {
  const assetList = FP.pipe(
    assets.split('|'),
    A.filterMap((assetString) => O.fromNullable(assetFromString(assetString)))
  )

  return (
    <AsymAssetsWarning
      assets={assetList}
      network={network}
      onClickOpenAsymTool={onClickOpenAsymTool}
      loading={loading}
    />
  )
}

const meta: ComponentMeta<typeof Template> = {
  component: Template,
  title: 'Components/Deposit/AsymAssetsWarning',
  argTypes: {
    network: {
      name: 'Network',
      control: {
        type: 'select',
        options: ['mainnet', 'stagenet', 'testnet']
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
    assets: {
      name: 'Assets',
      control: {
        type: 'select',
        options: ['BNB.BNB', 'BNB.BNB|BTC.BTC', 'ETH.ETH']
      },
      defaultValue: 'BNB.BNB'
    },
    onClickOpenAsymTool: {
      action: 'onClickOpenAsymTool'
    }
  }
}

export default meta

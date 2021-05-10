import { useMemo, useState } from 'react'

import { Story } from '@storybook/react'
import { AssetRuneNative, AssetLTC, AssetBNB, AssetETH, assetToString, assetFromString } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { ASSETS_TESTNET, ERC20_TESTNET } from '../../../shared/mock/assets'
import { PoolFilter } from '../../services/midgard/types'
import { AssetsFilter } from './AssetsFilter'

export const Default: Story<{ assets: string[] }> = ({ assets: stringAssets }) => {
  const assets = useMemo(
    () => FP.pipe(stringAssets || [], A.filterMap(FP.flow(assetFromString, O.fromNullable))),
    [stringAssets]
  )

  const [filter, setFilter] = useState<O.Option<PoolFilter>>(O.none)

  return <AssetsFilter setFilter={setFilter} activeFilter={filter} assets={assets} />
}

const argTypes = {
  assets: {
    control: {
      type: 'inline-check',
      options: [
        AssetRuneNative,
        AssetLTC,
        AssetBNB,
        ASSETS_TESTNET.BUSD,
        ASSETS_TESTNET.USDT,
        AssetETH,
        ERC20_TESTNET.USDT
      ].map(assetToString)
    }
  }
}

Default.args = {
  assets: argTypes.assets.control.options
}

export default {
  component: AssetsFilter,
  title: 'AssetsFilter',
  argTypes
}

import { useMemo, useState } from 'react'

import { Story } from '@storybook/react'
import {
  AssetRuneNative,
  AssetLTC,
  AssetBNB,
  AssetETH,
  assetToString,
  assetFromString,
  BNBChain,
  ETHChain,
  Asset
} from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { AssetsFilter } from './AssetsFilter'

export const Default: Story<{ assets: string[] }> = ({ assets: stringAssets }) => {
  const assets = useMemo(
    () =>
      FP.pipe(
        stringAssets || [],
        A.filterMap((asset) => {
          const res = assetFromString(asset)
          return res ? O.some(res) : O.none
        })
      ),
    [stringAssets]
  )

  const [filteredAssets, setFilteredAssets] = useState(assets)
  return (
    <>
      <AssetsFilter assets={assets} onFilterChanged={setFilteredAssets} />
      <div>Results</div>
      {filteredAssets.map((asset) => (
        <div key={assetToString(asset)}>{assetToString(asset)}</div>
      ))}
    </>
  )
}

const argTypes = {
  assets: {
    control: {
      type: 'inline-check',
      options: [
        AssetRuneNative,
        AssetLTC,
        AssetBNB,
        { chain: BNBChain, ticker: 'BUSD', symbol: 'BUSD' } as Asset,
        { chain: BNBChain, ticker: 'USDT', symbol: 'USDT' } as Asset,
        AssetETH,
        { chain: ETHChain, ticker: 'USDT', symbol: 'USDT' } as Asset
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

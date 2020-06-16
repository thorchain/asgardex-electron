import React from 'react'

import { boolean } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/react'
import { PoolData } from '@thorchain/asgardex-util'

import { ONE_ASSET_BASE_AMOUNT } from '../../const'
import { PoolAsset, PricePools, PricePoolAsset } from '../../views/pools/types'
import HeaderCurrency from './HeaderCurrency'

const poolData: PoolData = { assetBalance: ONE_ASSET_BASE_AMOUNT, runeBalance: ONE_ASSET_BASE_AMOUNT }

const pools: PricePools = [
  { asset: PoolAsset.RUNE, poolData },
  { asset: PoolAsset.BTC, poolData },
  { asset: PoolAsset.ETH, poolData },
  { asset: PoolAsset.TUSDB, poolData }
]

storiesOf('Components/HeaderCurrency', module).add('desktop / mobile', () => {
  const changeHandler = (asset: PricePoolAsset) => console.log(`changed: ${asset}`)
  const isDesktopView = boolean('isDesktopView', false)
  return <HeaderCurrency pools={pools} isDesktopView={isDesktopView} changeHandler={changeHandler} />
})

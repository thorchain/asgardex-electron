import {
  Asset,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  BCHChain,
  BNBChain,
  BTCChain,
  ETHChain,
  LTCChain
} from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { ASSETS_TESTNET, ERC20_TESTNET } from '../../../shared/mock/assets'
import { filterAssets, getAvailableChains, BASE_FILTER } from './AssetsFilter.helper'

describe('getAvailableChains', () => {
  it('should return O.none', () => {
    expect(getAvailableChains([])).toEqual(O.none)
    expect(getAvailableChains([AssetBNB], [])).toEqual(O.none)
    expect(getAvailableChains([AssetBNB, AssetBCH], [BTCChain])).toEqual(O.none)
  })

  it('should return O.some and starts with BASE_FILTER', () => {
    expect(getAvailableChains([AssetBNB], [BNBChain])).toEqual(O.some([BASE_FILTER, BNBChain]))
    expect(
      getAvailableChains([AssetBNB, ASSETS_TESTNET.USDT, AssetBCH, AssetBTC], [BNBChain, BTCChain, BCHChain])
    ).toEqual(O.some([BASE_FILTER, BNBChain, BTCChain, BCHChain]))

    expect(getAvailableChains([AssetBNB, AssetBCH, AssetBTC], [BNBChain, BTCChain])).toEqual(
      O.some([BASE_FILTER, BNBChain, BTCChain])
    )
  })
})

describe('filterAssets', () => {
  const assets: Asset[] = [AssetBNB, AssetBCH, AssetBTC, ASSETS_TESTNET.USDT, ASSETS_TESTNET.BOLT, ERC20_TESTNET.USDT]

  const filter = filterAssets(assets)

  it('should return assets in case no oFilter provided', () => {
    expect(filter(O.none)).toEqual(assets)
  })

  it('should return only chains base-assets', () => {
    expect(filter(O.some('base'))).toEqual([AssetBNB, AssetBCH, AssetBTC])
  })

  it('should return only ETH-chain assets', () => {
    expect(filter(O.some(ETHChain))).toEqual([ERC20_TESTNET.USDT])
  })

  it('should return only BNB-chain assets', () => {
    expect(filter(O.some(BNBChain))).toEqual([AssetBNB, ASSETS_TESTNET.USDT, ASSETS_TESTNET.BOLT])
  })

  it('should return empty array', () => {
    expect(filter(O.some(LTCChain))).toEqual([])
  })
})

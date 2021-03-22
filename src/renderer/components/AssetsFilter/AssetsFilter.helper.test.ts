import { AssetBCH, AssetBNB, AssetBTC, BCHChain, BNBChain, BTCChain } from '@xchainjs/xchain-util'
import * as O from 'fp-ts/Option'

import { ASSETS_TESTNET } from '../../../shared/mock/assets'
import { getAvailableChains } from './AssetsFilter.helper'

describe('getAvailableChains', () => {
  it('should return O.none', () => {
    expect(getAvailableChains([])).toEqual(O.none)
    expect(getAvailableChains([AssetBNB], [])).toEqual(O.none)
    expect(getAvailableChains([AssetBNB, AssetBCH], [BTCChain])).toEqual(O.none)
  })

  it('should return O.some and starts with BASE_FILTER', () => {
    expect(getAvailableChains([AssetBNB], [BNBChain])).toEqual(O.some(['base', 'usd', BNBChain]))
    expect(
      getAvailableChains([AssetBNB, ASSETS_TESTNET.USDT, AssetBCH, AssetBTC], [BNBChain, BTCChain, BCHChain])
    ).toEqual(O.some(['base', 'usd', BNBChain, BTCChain, BCHChain]))

    expect(getAvailableChains([AssetBNB, AssetBCH, AssetBTC], [BNBChain, BTCChain])).toEqual(
      O.some(['base', 'usd', BNBChain, BTCChain])
    )
  })
})

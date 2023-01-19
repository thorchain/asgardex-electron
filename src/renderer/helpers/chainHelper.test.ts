import { BNBChain } from '@xchainjs/xchain-binance'
import { BTCChain } from '@xchainjs/xchain-bitcoin'
import { BCHChain } from '@xchainjs/xchain-bitcoincash'
import { GAIAChain } from '@xchainjs/xchain-cosmos'
import { DOGEChain } from '@xchainjs/xchain-doge'
import { ETHChain } from '@xchainjs/xchain-ethereum'
import { LTCChain } from '@xchainjs/xchain-litecoin'
import { THORChain } from '@xchainjs/xchain-thorchain'

import { AssetBNB, AssetBTC, AssetETH, AssetRuneNative } from '../../shared/utils/asset'
import {
  getChainAsset,
  isBchChain,
  isBnbChain,
  isBtcChain,
  isCosmosChain,
  isDogeChain,
  isEthChain,
  isLtcChain,
  isThorChain
} from './chainHelper'

describe('helpers/chainHelper', () => {
  describe('getChainAsset', () => {
    it('returns asset for BNB chain', () => {
      expect(getChainAsset(BNBChain)).toEqual(AssetBNB)
    })
    it('returns asset for BTC chain', () => {
      expect(getChainAsset(BTCChain)).toEqual(AssetBTC)
    })
    it('returns asset for ETH chain', () => {
      expect(getChainAsset(ETHChain)).toEqual(AssetETH)
    })
    it('returns asset for THOR chain', () => {
      expect(getChainAsset(THORChain)).toEqual(AssetRuneNative)
    })
  })

  describe('is{XYZ}Chain', () => {
    it('BTCChain -> true', () => {
      expect(isBtcChain(BTCChain)).toBeTruthy()
    })
    it('BTCChain -> false', () => {
      expect(isBtcChain(ETHChain)).toBeFalsy()
    })
    it('THORChain -> true', () => {
      expect(isThorChain(THORChain)).toBeTruthy()
    })
    it('THORChain -> false', () => {
      expect(isThorChain(ETHChain)).toBeFalsy()
    })

    it('LTCChain -> true', () => {
      expect(isLtcChain(LTCChain)).toBeTruthy()
    })
    it('LTCChain -> false', () => {
      expect(isLtcChain(ETHChain)).toBeFalsy()
    })

    it('BNBChain -> true', () => {
      expect(isBnbChain(BNBChain)).toBeTruthy()
    })
    it('BNBChain -> false', () => {
      expect(isBnbChain(ETHChain)).toBeFalsy()
    })

    it('BCHChain -> true', () => {
      expect(isBchChain(BCHChain)).toBeTruthy()
    })
    it('BCHChain -> false', () => {
      expect(isBchChain(ETHChain)).toBeFalsy()
    })

    it('ETHChain -> true', () => {
      expect(isEthChain(ETHChain)).toBeTruthy()
    })
    it('ETHChain -> false', () => {
      expect(isEthChain(BNBChain)).toBeFalsy()
    })

    it('DOGEChain -> true', () => {
      expect(isDogeChain(DOGEChain)).toBeTruthy()
    })
    it('DOGEChain -> false', () => {
      expect(isDogeChain(ETHChain)).toBeFalsy()
    })

    it('CosmosChain -> true', () => {
      expect(isCosmosChain(GAIAChain)).toBeTruthy()
    })
    it('CosmosChain -> false', () => {
      expect(isCosmosChain(ETHChain)).toBeFalsy()
    })
  })
})

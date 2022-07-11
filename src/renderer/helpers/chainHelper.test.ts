import {
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetRuneNative,
  BCHChain,
  BNBChain,
  BTCChain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  TerraChain,
  THORChain
} from '@xchainjs/xchain-util'

import {
  getChainAsset,
  isBchChain,
  isBnbChain,
  isBtcChain,
  isCosmosChain,
  isDogeChain,
  isEthChain,
  isLtcChain,
  isTerraChain,
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

    it('TerraChain -> true', () => {
      expect(isTerraChain(TerraChain)).toBeTruthy()
    })
    it('TerraChain -> false', () => {
      expect(isTerraChain(ETHChain)).toBeFalsy()
    })

    it('CosmosChain -> true', () => {
      expect(isCosmosChain(CosmosChain)).toBeTruthy()
    })
    it('CosmosChain -> false', () => {
      expect(isCosmosChain(ETHChain)).toBeFalsy()
    })
  })
})

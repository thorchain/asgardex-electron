import { Asset, AssetBNB, AssetBTC, AssetETH, AssetRuneNative, Chain } from '@thorchain/asgardex-util'

export const getChainAsset = (chain: Chain): Asset => {
  switch (chain) {
    case 'BNB':
      return AssetBNB
    case 'BTC':
      return AssetBTC
    case 'ETH':
      return AssetETH
    case 'THOR':
      return AssetRuneNative
  }
}

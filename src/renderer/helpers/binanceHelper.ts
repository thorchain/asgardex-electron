import { Balance } from '@thorchain/asgardex-binance'
import { Asset, bnOrZero, assetAmount, AssetAmount } from '@thorchain/asgardex-util'

type PickBalanceAmount = Pick<Balance, 'symbol' | 'free'>

export const balanceByAsset = (txs: PickBalanceAmount[], asset: Asset): AssetAmount => {
  const tx = txs.find(({ symbol }) => symbol === asset.symbol)
  return assetAmount(bnOrZero(tx?.free))
}

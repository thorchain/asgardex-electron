import { Balance, Fees, isTransferFee } from '@thorchain/asgardex-binance'
import { Asset, bnOrZero, assetAmount, AssetAmount, baseAmount } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { TransferFees } from '../services/binance/types'

type PickBalanceAmount = Pick<Balance, 'symbol' | 'free'>

export const balanceByAsset = (txs: PickBalanceAmount[], asset: Asset): AssetAmount => {
  const tx = txs.find(({ symbol }) => symbol === asset.symbol)
  return assetAmount(bnOrZero(tx?.free))
}

export const isMiniToken = ({ symbol }: Pick<Asset, 'symbol'>): boolean => {
  const [, two] = symbol.split('-')
  return two?.length === 4 && two?.endsWith('M')
}

export const getTransferFees = (fees: Fees): O.Option<TransferFees> =>
  FP.pipe(
    fees,
    A.findFirst(isTransferFee),
    O.filter((item) => item?.fixed_fee_params?.fee !== undefined && item?.multi_transfer_fee !== undefined),
    O.map(
      (item) =>
        ({ single: baseAmount(item.fixed_fee_params.fee), multi: baseAmount(item.multi_transfer_fee) } as TransferFees)
    )
  )

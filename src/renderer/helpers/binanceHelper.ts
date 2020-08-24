import { Balance, Fees, isTransferFee } from '@thorchain/asgardex-binance'
import { Asset, bnOrZero, assetAmount, AssetAmount, baseAmount, baseToAsset } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
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

export const isBinanceChain = ({ chain }: Pick<Asset, 'chain'>): boolean => chain === 'BNB'

export const getTransferFees = (fees: Fees): E.Either<Error, TransferFees> =>
  FP.pipe(
    fees,
    A.findFirst(isTransferFee),
    E.fromOption(() => new Error('Could not find transfer fees')),
    E.filterOrElse(
      (item) => item?.fixed_fee_params?.fee !== undefined && item?.multi_transfer_fee !== undefined,
      () => new Error('Could not parse transfer fees')
    ),
    E.map(
      (item) =>
        ({
          single: baseToAsset(baseAmount(item.fixed_fee_params.fee)),
          multi: baseToAsset(baseAmount(item.multi_transfer_fee))
        } as TransferFees)
    )
  )

export const getSingleTxFee = (oTransferFees: O.Option<TransferFees>): O.Option<AssetAmount> =>
  FP.pipe(
    oTransferFees,
    O.map((f) => f.single)
  )

import { Fees, isTransferFee, isFee, Fee } from '@thorchain/asgardex-binance'
import { Asset, AssetAmount, baseAmount, baseToAsset } from '@thorchain/asgardex-util'
import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { TransferFees } from '../services/binance/types'

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

export const getFreezeFee = (fees: Fees): E.Either<Error, AssetAmount> =>
  FP.pipe(
    fees,
    A.findFirst((fee) => {
      return isFee(fee) && (fee as Fee).msg_type === 'tokensFreeze'
    }),
    E.fromOption(() => new Error('Could not find freeze fee')),
    E.map((item) => baseToAsset(baseAmount((item as Fee).fee)))
  )

export const getSingleTxFee = (oTransferFees: O.Option<TransferFees>): O.Option<AssetAmount> =>
  FP.pipe(
    oTransferFees,
    O.map((f) => f.single)
  )

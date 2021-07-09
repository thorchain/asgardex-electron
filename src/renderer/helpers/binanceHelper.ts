import { Asset, AssetAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { TransferFees } from '../services/binance/types'

export const isMiniToken = ({ symbol }: Pick<Asset, 'symbol'>): boolean => {
  const [, two] = symbol.split('-')
  return two?.length === 4 && two?.endsWith('M')
}

export const getSingleTxFee = (oTransferFees: O.Option<TransferFees>): O.Option<AssetAmount> =>
  FP.pipe(
    oTransferFees,
    O.map((f) => f.single)
  )

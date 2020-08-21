import { BaseAmount } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservable, useObservableState } from 'observable-hooks'
import { Observable } from 'rxjs'
import * as Rx from 'rxjs/operators'

import { TransferFees } from '../services/binance/types'

const useSingleTxFee = (transferFees$: Observable<O.Option<TransferFees>>): O.Option<BaseAmount> =>
  useObservableState<O.Option<BaseAmount>>(
    useObservable(() =>
      transferFees$.pipe(
        Rx.map((fees) =>
          FP.pipe(
            fees,
            O.map((f) => f.single)
          )
        )
      )
    ),
    O.none
  )

export default useSingleTxFee

import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { observableState } from '../../../helpers/stateHelper'
import * as ETH from '../../ethereum'
import { ApproveParams } from '../../ethereum/types'
import { ApproveFeeHandler } from '../types'

// state for reloading approve fees
const { get$: reloadApproveFee$, set: reloadApproveFee } = observableState<ApproveParams | undefined>(undefined)

const approveFee$: ApproveFeeHandler = (params) => {
  return reloadApproveFee$.pipe(
    RxOp.debounceTime(300),
    RxOp.switchMap((approveParams) => {
      return FP.pipe(
        Rx.from(
          // asset
          ETH.approveTxFee$(approveParams || params)
        )
      )
    })
  )
}

export { reloadApproveFee, approveFee$ }

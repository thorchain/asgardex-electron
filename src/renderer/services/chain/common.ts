import { THORChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { selectedPoolChain$ } from '../midgard/common'

const isCrossChainDeposit$: Rx.Observable<boolean> = selectedPoolChain$.pipe(
  RxOp.map(
    FP.flow(
      O.map((asset) => asset !== THORChain),
      O.getOrElse<boolean>(() => false)
    )
  ),
  RxOp.distinctUntilChanged()
)

export { isCrossChainDeposit$ }

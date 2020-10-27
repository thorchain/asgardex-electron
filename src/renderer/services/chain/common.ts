import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { isCrossChain } from '../../helpers/chainHelper'
import { selectedPoolChain$ } from '../midgard/common'

const isCrossChainStake$: Rx.Observable<boolean> = selectedPoolChain$.pipe(
  RxOp.map(
    FP.flow(
      O.map(isCrossChain),
      O.getOrElse<boolean>(() => false)
    )
  ),
  RxOp.distinctUntilChanged()
)

export { isCrossChainStake$ }

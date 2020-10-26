import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { isBaseChain } from '../../helpers/chainHelper'
import { selectedPoolChain$ } from '../midgard/common'

const isCrossChainStake$: Rx.Observable<boolean> = selectedPoolChain$.pipe(
  RxOp.map(
    FP.flow(
      O.map(isBaseChain),
      O.getOrElse<boolean>(() => false)
    )
  ),
  RxOp.distinctUntilChanged()
)

export { isCrossChainStake$ }

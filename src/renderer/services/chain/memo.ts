import { getDepositMemo } from '@thorchain/asgardex-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { BASE_CHAIN } from '../../const'
import { eqChain } from '../../helpers/fp/eq'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { selectedPoolAsset$ } from '../midgard/common'
import { baseAddress$ } from './address'
import { MemoRx } from './types'

/**
 * Stake memo
 */
const stakeMemoByChain$: MemoRx = Rx.combineLatest([selectedPoolAsset$, baseAddress$]).pipe(
  RxOp.switchMap(([oPoolAsset, oBaseAddress]) =>
    Rx.of(
      FP.pipe(
        sequenceTOption(oPoolAsset, oBaseAddress),
        O.map(([poolAsset, baseAddress]) => {
          const memo = eqChain.equals(poolAsset.chain, BASE_CHAIN)
            ? getDepositMemo(poolAsset)
            : // Add address to memo in case of x-chain deposit (needed to "wire" deposit txs together)
              getDepositMemo(poolAsset, baseAddress)
          return memo
        })
      )
    )
  )
)

export { stakeMemoByChain$ }

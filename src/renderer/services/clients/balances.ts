import * as RD from '@devexperts/remote-data-ts'
import { XChainClient } from '@xchainjs/xchain-client'
import * as Rx from 'rxjs'
import { catchError, startWith, map } from 'rxjs/operators'

import { ApiError, BalancesLD, ErrorId } from '../wallet/types'

/**
 * Observable to load balances
 */
export const loadBalances$ = (client: XChainClient): BalancesLD =>
  Rx.from(client.getBalance()).pipe(
    map(RD.success),
    catchError((error: Error) =>
      Rx.of(RD.failure({ errorId: ErrorId.GET_BALANCES, msg: error?.message ?? '' } as ApiError))
    ),
    startWith(RD.pending)
  )

import * as RD from '@devexperts/remote-data-ts'
import { WS, Client, Network as BinanceNetwork, Address } from '@xchainjs/xchain-binance'
import { Asset, assetToBase, baseToAsset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import {
  map,
  mergeMap,
  catchError,
  retry,
  shareReplay,
  startWith,
  switchMap,
  debounceTime,
  distinctUntilChanged
} from 'rxjs/operators'
import * as RxOperators from 'rxjs/operators'
import { webSocket } from 'rxjs/webSocket'

import { envOrDefault } from '../../helpers/envHelper'
import { eqOString } from '../../helpers/fp/eq'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { network$ } from '../app/service'
import { FeeLD } from '../chain/types'
import { GetExplorerTxUrl } from '../clients/types'
import { ClientStateForViews } from '../types'
import { getClient, getClientStateForViews } from '../utils'
import { keystoreService } from '../wallet/common'
import { BalancesRD, ApiError, ErrorId, BalancesLD, TxsPageLD, LoadTxsProps } from '../wallet/types'
import { getPhrase } from '../wallet/util'
import { createTransactionService } from './transaction'
import { BinanceClientState, TransferFeesRD, BinanceClientState$, Client$ } from './types'

/**
 * The only thing we export from this module is this factory
 * and it's called by `./context.ts` only once
 * ^ That's needed to "inject" same reference of `client$` used by other modules into this module
 */
export const createFeesService = (oClient$: Client$): FeesService => {}

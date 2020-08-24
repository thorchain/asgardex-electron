import * as RD from '@devexperts/remote-data-ts'
import { AssetAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { Observable } from 'rxjs'
import * as Rx from 'rxjs/operators'

import { getSingleTxFee } from '../helpers/binanceHelper'
import { TransferFeesRD } from '../services/binance/types'

export const useSingleTxFee = (transferFeesRD$: Observable<TransferFeesRD>): O.Option<AssetAmount> =>
  useObservableState(() => transferFeesRD$.pipe(Rx.map(RD.toOption), Rx.map(getSingleTxFee)), O.none)[0]

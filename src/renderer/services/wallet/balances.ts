import * as RD from '@devexperts/remote-data-ts'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { sequenceTRD } from '../../helpers/fpHelpers'
import * as BNB from '../binance/service'
import * as BTC from '../bitcoin/service'
import { AssetsWithBalanceRD } from './types'

const reloadBalances = () => {
  BTC.reloadBalances()
  BNB.reloadBalances()
}

const assetsWB$: Observable<AssetsWithBalanceRD> = Rx.combineLatest([BNB.assetsWB$, BTC.assetsWB$]).pipe(
  map(([bnbAssetsWB, btcAssetsWB]) => {
    return FP.pipe(sequenceTRD(bnbAssetsWB, btcAssetsWB), RD.map(A.flatten))
  })
)

export { reloadBalances, assetsWB$ }

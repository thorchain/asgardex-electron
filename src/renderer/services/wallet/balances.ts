import * as RD from '@devexperts/remote-data-ts'
import { AssetBNB, Chain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import * as RxOp from 'rxjs/operators'

import { getRuneAsset } from '../../helpers/assetHelper'
import { eqAssetsWithBalanceRD } from '../../helpers/fp/eq'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { network$ } from '../app/service'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import * as ETH from '../ethereum'
import { selectedAsset$ } from './common'
import { INITIAL_BALANCES_STATE } from './const'
import { ChainBalance, BalancesRD, BalancesState, LoadBalancesHandler } from './types'
import { sortBalances } from './util'

export const reloadBalances = () => {
  BTC.reloadBalances()
  BNB.reloadBalances()
  ETH.reloadBalances()
}

const reloadBalancesByChain = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      return BNB.reloadBalances
    case 'BTC':
      return BTC.reloadBalances
    case 'ETH':
      return ETH.reloadBalances
    case 'THOR':
      // reload THOR balances - not available yet
      return () => {}
    default:
      return () => {}
  }
}

export const reloadBalances$: Rx.Observable<O.Option<LoadBalancesHandler>> = selectedAsset$.pipe(
  RxOp.map(O.map(({ chain }) => reloadBalancesByChain(chain)))
)

/**
 * Transforms BNB data (address + `AssetsWB`) into `AssetsWBChain`
 */
const bnbAssetsWBChain$: Observable<ChainBalance> = Rx.combineLatest([BNB.address$, BNB.balances$, network$]).pipe(
  map(
    ([address, balances, network]) =>
      ({
        chain: 'BNB',
        address: FP.pipe(
          address,
          O.getOrElse(() => '')
        ),
        balances: FP.pipe(
          balances,
          RD.map((assets) => sortBalances(assets, [AssetBNB.ticker, getRuneAsset({ network, chain: 'BNB' }).ticker]))
        )
      } as ChainBalance)
  )
)

/**
 * Transforms BTC data (address + `AssetWB`) into `AssetsWBChain`
 */
const btcAssetsWBChain$: Observable<ChainBalance> = Rx.combineLatest([BTC.address$, BTC.assetsWB$]).pipe(
  map(
    ([address, assetsWB]) =>
      ({
        chain: 'BTC',
        address: FP.pipe(
          address,
          O.getOrElse(() => '')
        ),
        balances: assetsWB
      } as ChainBalance)
  )
)

/**
 * Transforms ETH data (address + `AssetsWBChain`) into `AssetsWBChain`
 */
// TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH
const _ethBalancesChain$: Observable<ChainBalance> = Rx.combineLatest([ETH.address$, ETH.balances$]).pipe(
  map(
    ([address, balancesRD]) =>
      ({
        chain: 'ETH',
        address: FP.pipe(
          address,
          O.getOrElse(() => '')
        ),
        balances: FP.pipe(
          balancesRD,
          RD.map((balances) => [balances])
        )
      } as ChainBalance)
  )
)

/**
 * List of `AssetsWBChain` for all available chains (order is important)
 */
export const assetsWBChains$ = Rx.combineLatest([
  btcAssetsWBChain$,
  /* //TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH */
  /* ethBalancesChain$ */
  bnbAssetsWBChain$
])

// TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH
const _ethBalances$: Observable<BalancesRD> = ETH.balances$.pipe(liveData.map((asset) => [asset]))

/**
 * Transform a list of AssetsWithBalanceRD
 * into a "single" state of `AssetsWithBalanceState`
 * Because we need to have loading / error / data combined in one "state" object in some cases
 */
export const balancesState$: Observable<BalancesState> = Rx.combineLatest([
  BNB.balances$,
  BTC.assetsWB$
  // TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH
  // ethBalances$
]).pipe(
  map((balancesList) => ({
    balances: FP.pipe(
      balancesList,
      // filter results out
      // Transformation: RD<Error, AssetsWithBalance>`-> `AssetsWithBalance)[]`
      A.filterMap(RD.toOption),
      A.flatten,
      NEA.fromArray
    ),
    loading: FP.pipe(balancesList, A.elem(eqAssetsWithBalanceRD)(RD.pending)),
    errors: FP.pipe(
      balancesList,
      // filter errors out
      A.filter(RD.isFailure),
      // Transformation to get Errors out of RD:
      // `RemoteData<Error, never>[]` -> `RemoteData<never, Error>[]` -> `O.some(Error)[]`
      A.map(FP.flow(RD.recover(O.some), RD.toOption)),
      // Transformation: `O.some(Error)[]` -> `O.some(Error[])`
      sequenceTOptionFromArray,
      O.chain(NEA.fromArray)
    )
  })),
  startWith(INITIAL_BALANCES_STATE)
)

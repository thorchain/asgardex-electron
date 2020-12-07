import * as RD from '@devexperts/remote-data-ts'
import { AssetBNB, BTCChain, Chain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import { map, shareReplay, startWith } from 'rxjs/operators'
import * as RxOp from 'rxjs/operators'

import { getRuneAsset } from '../../helpers/assetHelper'
import { eqAssetsWithBalanceRD } from '../../helpers/fp/eq'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { network$ } from '../app/service'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import { WalletBalancesRD } from '../clients'
import * as ETH from '../ethereum'
import * as THOR from '../thorchain'
import { selectedAsset$ } from './common'
import { INITIAL_BALANCES_STATE } from './const'
import { ChainBalance, BalancesState, LoadBalancesHandler } from './types'
import { sortBalances } from './util'

export const reloadBalances = () => {
  BTC.reloadBalances()
  BNB.reloadBalances()
  // TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH
  // ETH.reloadBalances()
  THOR.reloadBalances()
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
      return THOR.reloadBalances
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
const thorBalance$: Observable<ChainBalance> = Rx.combineLatest([THOR.address$, THOR.balances$]).pipe(
  map(
    ([address, balances]) =>
      ({
        chain: 'THOR',
        address: FP.pipe(
          address,
          O.getOrElse(() => '')
        ),
        balances
      } as ChainBalance)
  )
)

/**
 * Transforms BNB data (address + `AssetsWB`) into `AssetsWBChain`
 */
const bnbBalance$: Observable<ChainBalance> = Rx.combineLatest([BNB.address$, BNB.balances$, network$]).pipe(
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
const btcBalance$: Observable<ChainBalance> = Rx.combineLatest([BTC.address$, BTC.balances$]).pipe(
  map(
    ([address, balances]) =>
      ({
        chain: 'BTC',
        address: FP.pipe(
          address,
          O.getOrElse(() => '')
        ),
        balances
      } as ChainBalance)
  )
)
/**
 * Same as btcBalance$ but for address from BTC.ledgerAddress$
 */
const btcLedgerChainBalance$: Observable<ChainBalance> = FP.pipe(
  BTC.ledgerAddress$,
  RxOp.switchMap((addressRd) =>
    FP.pipe(
      addressRd,
      RD.map(BTC.getBalanceByAddress$),
      RD.map(
        RxOp.map(
          (balances) =>
            ({
              chain: BTCChain,
              address: FP.pipe(
                addressRd,
                // This stream's branch is based on Successful addressRd
                // so addressRd will always have a value here
                RD.getOrElse(() => '')
              ),
              balances
            } as ChainBalance)
        )
      ),
      RD.getOrElse(() =>
        Rx.of({
          chain: BTCChain,
          address: '',
          balances: RD.initial
        } as ChainBalance)
      )
    )
  ),
  shareReplay(1)
)

const btcLedgerBalance$ = FP.pipe(
  btcLedgerChainBalance$,
  RxOp.map((ledgerBalances) => ledgerBalances.balances)
)

/**
 * Transforms ETH data (address + `AssetsWBChain`) into `AssetsWBChain`
 */
// TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH
const _ethBalance$: Observable<ChainBalance> = Rx.combineLatest([ETH.address$, ETH.balances$]).pipe(
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
export const chainBalances$ = Rx.combineLatest([
  thorBalance$,
  btcBalance$,
  btcLedgerChainBalance$,
  /* //TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH */
  /* ethBalancesChain$ */
  bnbBalance$
])

// TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH
const _ethBalances$: Observable<WalletBalancesRD> = ETH.balances$.pipe(liveData.map((asset) => [asset]))

/**
 * Transform a list of BalancesLD
 * into a "single" state of `BalancesState`
 * to provide loading / error / data states in a single "state" object
 */
export const balancesState$: Observable<BalancesState> = Rx.combineLatest([
  THOR.balances$,
  BNB.balances$,
  btcLedgerBalance$,
  BTC.balances$
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

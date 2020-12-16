import * as RD from '@devexperts/remote-data-ts'
import { AssetBNB, BNBChain, BTCChain, Chain, THORChain } from '@xchainjs/xchain-util'
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
import { WalletBalancesLD } from '../clients'
import * as ETH from '../ethereum'
import * as THOR from '../thorchain'
import { selectedAsset$ } from './common'
import { INITIAL_BALANCES_STATE } from './const'
import { BalancesState, LoadBalancesHandler, ChainBalances$, ChainBalance$, ChainBalance } from './types'
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
      // TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH
      // return ETH.reloadBalances
      return () => {}
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
 * Transforms THOR balances into `ChainBalances`
 */
const thorChainBalance$: ChainBalance$ = Rx.combineLatest([THOR.address$, THOR.balances$]).pipe(
  map(([address, balances]) => ({
    chain: THORChain,
    address,
    balances
  }))
)

/**
 * Transforms BNB balances into `ChainBalances`
 */
const bnbChainBalance$: ChainBalance$ = Rx.combineLatest([BNB.address$, BNB.balances$, network$]).pipe(
  map(([address, balances, network]) => ({
    chain: BNBChain,
    address,
    balances: FP.pipe(
      balances,
      RD.map((assets) => sortBalances(assets, [AssetBNB.ticker, getRuneAsset({ network, chain: 'BNB' }).ticker]))
    )
  }))
)

/**
 * Transforms BTC balances into `ChainBalance`
 */
const btcChainBalance$: ChainBalance$ = Rx.combineLatest([BTC.address$, BTC.balances$]).pipe(
  map(([address, balances]) => ({
    chain: BTCChain,
    address,
    balances
  }))
)

const btcLedgerChainBalance$: ChainBalance$ = FP.pipe(
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
              address: FP.pipe(addressRd, RD.toOption),
              balances
            } as ChainBalance)
        )
      ),
      RD.getOrElse(() =>
        Rx.of({
          chain: BTCChain,
          address: O.none,
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
 * Transforms ETH data (address + `WalletBalance`) into `ChainBalance`
 */
// TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH
const _ethChainBalance$: ChainBalance$ = Rx.combineLatest([ETH.address$, ETH.balances$]).pipe(
  map(([address, balancesRD]) => ({
    chain: 'ETH',
    address,
    balances: FP.pipe(
      balancesRD,
      RD.map((balances) => [balances])
    )
  }))
)

/**
 * List of `ChainBalances` for all available chains (order is important)
 */
export const chainBalances$: ChainBalances$ = Rx.combineLatest([
  thorChainBalance$,
  btcChainBalance$,
  btcLedgerChainBalance$,
  bnbChainBalance$,
  /* //TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH */
  /* _ethChainBalance$ */
  bnbChainBalance$
])

// TODO (@veado | @thatStrangeGuyThorchain) Enable to support ETH
const _ethBalances$: WalletBalancesLD = ETH.balances$.pipe(liveData.map((asset) => [asset]))

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
    // TODO(@Veado) Update eqAssetsWithBalanceRD
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

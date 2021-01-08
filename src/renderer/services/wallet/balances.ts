import * as RD from '@devexperts/remote-data-ts'
import { AssetBNB, BNBChain, BTCChain, Chain, ETHChain, THORChain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { getBnbRuneAsset } from '../../helpers/assetHelper'
import { eqBalancesRD } from '../../helpers/fp/eq'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { network$ } from '../app/service'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import { WalletBalancesRD } from '../clients'
import * as ETH from '../ethereum'
import * as THOR from '../thorchain'
import { selectedAsset$ } from './common'
import { INITIAL_BALANCES_STATE } from './const'
import { BalancesState, LoadBalancesHandler, ChainBalances$, ChainBalance$, ChainBalance } from './types'
import { sortBalances } from './util'

export const reloadBalances: FP.Lazy<void> = () => {
  BTC.reloadBalances()
  BNB.reloadBalances()
  ETH.reloadBalances()
  THOR.reloadBalances()
}

const reloadBalancesByChain: (chain: Chain) => FP.Lazy<void> = (chain) => {
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
 * Transforms THOR balances into `ChainBalances`
 */
const thorChainBalance$: ChainBalance$ = Rx.combineLatest([THOR.address$, THOR.balances$]).pipe(
  RxOp.map(([walletAddress, balances]) => ({
    walletType: 'keystore',
    chain: THORChain,
    walletAddress,
    balances
  }))
)

/**
 * Transforms BNB balances into `ChainBalances`
 */
const bnbChainBalance$: ChainBalance$ = Rx.combineLatest([BNB.address$, BNB.balances$, network$]).pipe(
  RxOp.map(([walletAddress, balances, network]) => ({
    walletType: 'keystore',
    chain: BNBChain,
    walletAddress,
    balances: FP.pipe(
      balances,
      RD.map((assets) => sortBalances(assets, [AssetBNB.ticker, getBnbRuneAsset(network).ticker]))
    )
  }))
)

/**
 * Transforms BTC balances into `ChainBalance`
 */
const btcChainBalance$: ChainBalance$ = Rx.combineLatest([BTC.address$, BTC.balances$]).pipe(
  RxOp.map(([walletAddress, balances]) => ({
    walletType: 'keystore',
    chain: BTCChain,
    walletAddress,
    balances
  }))
)

const btcLedgerChainBalance$: ChainBalance$ = FP.pipe(
  BTC.ledgerAddress$,
  RxOp.switchMap((addressRd) =>
    FP.pipe(
      addressRd,
      RD.map((address) => BTC.getBalanceByAddress$(address, 'ledger')),
      RD.map(
        RxOp.map<WalletBalancesRD, ChainBalance>((balances) => ({
          walletType: 'ledger',
          chain: BTCChain,
          walletAddress: FP.pipe(addressRd, RD.toOption),
          balances
        }))
      ),
      RD.getOrElse(() =>
        Rx.of<ChainBalance>({
          walletType: 'ledger',
          chain: BTCChain,
          walletAddress: O.none,
          balances: RD.initial
        })
      )
    )
  ),
  RxOp.shareReplay(1)
)

const btcLedgerBalance$ = FP.pipe(
  btcLedgerChainBalance$,
  RxOp.map((ledgerBalances) => ledgerBalances.balances)
)

/**
 * Transforms ETH data (address + `WalletBalance`) into `ChainBalance`
 */
const ethChainBalance$: ChainBalance$ = Rx.combineLatest([ETH.address$, ETH.balances$]).pipe(
  RxOp.map(([walletAddress, balances]) => ({
    walletType: 'keystore',
    chain: ETHChain,
    walletAddress,
    balances
  }))
)

/**
 * List of `ChainBalances` for all available chains (order is important)
 */
export const chainBalances$: ChainBalances$ = Rx.combineLatest([
  thorChainBalance$,
  btcChainBalance$,
  btcLedgerChainBalance$,
  ethChainBalance$,
  bnbChainBalance$
])

/**
 * Transform a list of BalancesLD
 * into a "single" state of `BalancesState`
 * to provide loading / error / data states in a single "state" object
 *
 * Note: Empty list of balances won't be included in `BalancesState`!!
 */
export const balancesState$: Observable<BalancesState> = Rx.combineLatest([
  THOR.balances$,
  BNB.balances$,
  btcLedgerBalance$,
  BTC.balances$,
  ETH.balances$
]).pipe(
  RxOp.map((balancesList) => ({
    balances: FP.pipe(
      balancesList,
      // filter results out
      // Transformation: RD<ApiError, WalletBalances>[]`-> `WalletBalances[]`
      A.filterMap(RD.toOption),
      A.flatten,
      NEA.fromArray
    ),
    loading: FP.pipe(balancesList, A.elem(eqBalancesRD)(RD.pending)),
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
  RxOp.startWith(INITIAL_BALANCES_STATE)
)

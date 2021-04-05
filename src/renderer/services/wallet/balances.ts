import * as RD from '@devexperts/remote-data-ts'
import { AssetBNB, BCHChain, BNBChain, BTCChain, Chain, ETHChain, LTCChain, THORChain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { ETHAssets } from '../../const'
import { getBnbRuneAsset } from '../../helpers/assetHelper'
import { filterEnabledChains } from '../../helpers/chainHelper'
import { eqBalancesRD } from '../../helpers/fp/eq'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
// import { observableState } from '../../helpers/stateHelper'
import { network$ } from '../app/service'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import * as BCH from '../bitcoincash'
import { WalletBalancesLD, WalletBalancesRD } from '../clients'
import * as ETH from '../ethereum'
import * as LTC from '../litecoin'
import * as THOR from '../thorchain'
import { INITIAL_BALANCES_STATE } from './const'
import { BalancesState, ChainBalances$, ChainBalance$, ChainBalance } from './types'
import { sortBalances } from './util'

// const { get$: reloadChainBalance$, set: reloadChainBalance } = observableState('')

export const reloadBalances: FP.Lazy<void> = () => {
  // console.log('reload all balances')
  // reloadChainBalance('trigger')
  // setTimeout(() => reloadChainBalance(''), 0)
  BTC.reloadBalances()
  BNB.reloadBalances()
  ETH.reloadBalances()
  THOR.reloadBalances()
  LTC.reloadBalances()
  BCH.reloadBalances()
}

export const reloadBalancesByChain: (chain: Chain, state?: 'trigger' | '') => FP.Lazy<void> = (chain, state) => {
  console.log('reload ', chain)
  switch (chain) {
    case 'BNB':
      return () => BNB.reloadBalances(state)
    case 'BTC':
      return () => BTC.reloadBalances(state)
    case 'BCH':
      return () => BCH.reloadBalances(state)
    case 'ETH':
      return () => ETH.reloadBalances(state)
    case 'THOR':
      return () => THOR.reloadBalances(state)
    case 'LTC':
      return () => LTC.reloadBalances(state)
    default:
      return () => {}
  }
}

const balanceRecord: Partial<Record<Network, Partial<Record<Chain, WalletBalancesRD>>>> = {}

const getChainBalanceData$: (chain: Chain) => WalletBalancesLD = (chain) => {
  switch (chain) {
    case 'BNB':
      return BNB.balances$
    case 'BTC':
      return BTC.balances$
    case 'BCH':
      return BCH.balances$
    case 'ETH':
      return FP.pipe(
        network$,
        RxOp.switchMap((network) => ETH.balances$(network === 'testnet' ? ETHAssets : undefined))
      )
    case 'THOR':
      return THOR.balances$
    case 'LTC':
      return LTC.balances$
    default:
      return Rx.of(RD.initial)
  }
}

const getChainBalanceReload$ = (chain: Chain) => {
  switch (chain) {
    case 'BNB':
      return BNB.reloadBalances$
    case 'BTC':
      return BTC.reloadBalances$
    case 'BCH':
      return BCH.reloadBalances$
    case 'ETH':
      return ETH.reloadBalances$
    case 'THOR':
      return THOR.reloadBalances$
    case 'LTC':
      return LTC.reloadBalances$
    default:
      return Rx.EMPTY
  }
}

// eslint-disable-next-line
// @ts-ignore
window.asd = reloadBalancesByChain

//
const getChainBalance$ = (chain: Chain): WalletBalancesLD => {
  // let isCompleted = false
  const reload$ = FP.pipe(
    new Rx.Observable((obs$) => {
      getChainBalanceReload$(chain).subscribe(
        (v) => {
          // console.log('update trigger', chain, !!v)
          obs$.next(v)
        },
        () => {},
        () => {}
      )
    }),
    RxOp.finalize(() => {
      console.log(`reset ${chain} reload state`)
      // reloadChainBalance('')
      reloadBalancesByChain(chain, '')
      // isCompleted = true
    })
  )
  // FP.pipe(
  //   reloadChainBalance$,
  //   RxOp.switchMap((value) => {
  //     const res =
  //     return res
  //   })
  // )
  return FP.pipe(
    Rx.combineLatest([network$, reload$]),
    // RxOp.takeWhile(() => !isCompleted),
    RxOp.switchMap(([network, reloadTrigger]) => {
      if (balanceRecord[network] === undefined) {
        balanceRecord[network] = {}
      }
      const savedResult = balanceRecord[network]?.[chain]
      const rStream$ = getChainBalanceData$(chain)
      if (reloadTrigger === '') {
        if (savedResult) {
          return Rx.of(savedResult)
        }
        return FP.pipe(
          rStream$,
          RxOp.map((balances) => {
            // eslint-disable-next-line
            // @ts-ignore
            balanceRecord[network][chain] = balances
            return balances
          })
        )
      }
      if (savedResult) {
        return FP.pipe(
          rStream$,
          RxOp.map((balances) => {
            // eslint-disable-next-line
            // @ts-ignore
            balanceRecord[network][chain] = balances
            return balances
          }),
          RxOp.startWith(savedResult)
        )
      }
      return FP.pipe(
        rStream$,
        RxOp.map((balances) => {
          // eslint-disable-next-line
          // @ts-ignore
          balanceRecord[network][chain] = balances
          return balances
        })
      )
    }),
    RxOp.shareReplay(1)
  )
}

/**
 * Transforms THOR balances into `ChainBalances`
 */
const thorChainBalance$: ChainBalance$ = Rx.combineLatest([THOR.addressUI$, getChainBalance$('THOR')]).pipe(
  RxOp.map(([walletAddress, balances]) => ({
    walletType: 'keystore',
    chain: THORChain,
    walletAddress,
    balances
  }))
)

/**
 * Transforms LTC balances into `ChainBalances`
 */
const litecoinBalance$: ChainBalance$ = Rx.combineLatest([LTC.addressUI$, getChainBalance$('LTC')]).pipe(
  RxOp.map(([walletAddress, balances]) => ({
    walletType: 'keystore',
    chain: LTCChain,
    walletAddress,
    balances
  }))
)

/**
 * Transforms BCH balances into `ChainBalances`
 */
const bchChainBalance$: ChainBalance$ = Rx.combineLatest([BCH.addressUI$, getChainBalance$('BCH')]).pipe(
  RxOp.map(([walletAddress, balances]) => ({
    walletType: 'keystore',
    chain: BCHChain,
    walletAddress,
    balances
  }))
)

/**
 * Transforms BNB balances into `ChainBalances`
 */
const bnbChainBalance$: ChainBalance$ = Rx.combineLatest([BNB.addressUI$, getChainBalance$('BNB'), network$]).pipe(
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
const btcChainBalance$: ChainBalance$ = Rx.combineLatest([BTC.addressUI$, getChainBalance$('BTC')]).pipe(
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

// store reference to stream of ETH balances (testnet)
// let ethBalancesTestnet$: WalletBalancesLD
/**
 * Setter to return cached stream for ETH balances (testnet)
 * to use one (and same) stream created by `ETH.balances$` factory only
 */
const getEthBalancesTestnet$ = () => {
  // create stream if not available
  // if (!ethBalancesTestnet$) {
  //   ethBalancesTestnet$ = ETH.balances$(ETHAssets).pipe(RxOp.shareReplay(1))
  // }
  return getChainBalance$('ETH')
}

// store reference to stream of ETH balances (mainnet)
// let ethBalancesMainnet$: WalletBalancesLD

/**
 * Setter to return cached stream for ETH balances (mainnet)
 * to use one (and same) stream created by `ETH.balances$` factory only
 */
const getEthBalancesMainnet$ = () => {
  // if (!ethBalancesMainnet$) {
  //   ethBalancesMainnet$ = ETH.balances$().pipe(RxOp.shareReplay(1))
  // }
  return getChainBalance$('ETH')
}

// Call of `ETH.balances$` depends on network
const ethBalances$ = network$.pipe(
  RxOp.switchMap((network) => Rx.iif(() => network === 'testnet', getEthBalancesTestnet$(), getEthBalancesMainnet$()))
  // RxOp.shareReplay(1)
)
/**
 * Transforms ETH data (address + `WalletBalance`) into `ChainBalance`
 */
const ethChainBalance$: ChainBalance$ = Rx.combineLatest([ETH.addressUI$, ethBalances$]).pipe(
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
export const chainBalances$: ChainBalances$ = Rx.combineLatest(
  filterEnabledChains({
    THOR: [thorChainBalance$],
    BTC: [btcChainBalance$, btcLedgerChainBalance$],
    BCH: [bchChainBalance$],
    ETH: [ethChainBalance$],
    BNB: [bnbChainBalance$],
    LTC: [litecoinBalance$]
  })
).pipe(
  // we ignore all `ChainBalances` with state of `initial` balances
  // (e.g. a not connected Ledger )
  RxOp.map(A.filter(({ balances }) => !RD.isInitial(balances)))
)

/**
 * Transform a list of BalancesLD
 * into a "single" state of `BalancesState`
 * to provide loading / error / data states in a single "state" object
 *
 * Note: Empty list of balances won't be included in `BalancesState`!!
 */
export const balancesState$: Observable<BalancesState> = Rx.combineLatest(
  filterEnabledChains({
    THOR: [getChainBalance$('THOR')],
    BTC: [getChainBalance$('BTC'), btcLedgerBalance$],
    BCH: [getChainBalance$('BCH')],
    ETH: [ethBalances$],
    BNB: [getChainBalance$('BNB')],
    LTC: [getChainBalance$('LTC')]
  })
).pipe(
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

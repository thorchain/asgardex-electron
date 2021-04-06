import * as RD from '@devexperts/remote-data-ts'
import { AssetBNB, BCHChain, BNBChain, BTCChain, Chain, ETHChain, LTCChain, THORChain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable } from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ETHAssets } from '../../const'
import { getBnbRuneAsset } from '../../helpers/assetHelper'
import { filterEnabledChains } from '../../helpers/chainHelper'
import { eqBalancesRD } from '../../helpers/fp/eq'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
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

export const reloadBalances: FP.Lazy<void> = () => {
  BTC.reloadBalances()
  BNB.reloadBalances()
  ETH.reloadBalances()
  THOR.reloadBalances()
  LTC.reloadBalances()
  BCH.reloadBalances()
}

export const reloadBalancesByChain: (chain: Chain) => (state?: 'trigger' | '') => void = (chain) => {
  switch (chain) {
    case 'BNB':
      return (state) => BNB.reloadBalances(state)
    case 'BTC':
      return (state) => BTC.reloadBalances(state)
    case 'BCH':
      return (state) => BCH.reloadBalances(state)
    case 'ETH':
      return (state) => ETH.reloadBalances(state)
    case 'THOR':
      return (state) => THOR.reloadBalances(state)
    case 'LTC':
      return (state) => LTC.reloadBalances(state)
    default:
      return () => {}
  }
}

let balanceRecord: Partial<Record<Chain, WalletBalancesRD>> = {}

export const clearSavedBalances = () => {
  balanceRecord = {}
}

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

const getChainBalance$ = (chain: Chain): WalletBalancesLD => {
  const reload$ = FP.pipe(
    getChainBalanceReload$(chain),
    RxOp.finalize(() => {
      // on finish a stream reset reload-trigger
      // unsubscribe will be initiated on any View unmount
      reloadBalancesByChain(chain)('')
    })
  )

  return FP.pipe(
    reload$,
    RxOp.switchMap((reloadTrigger) => {
      const savedResult = balanceRecord[chain]
      if (reloadTrigger === '' && savedResult) {
        if (savedResult) {
          return Rx.of(savedResult)
        }
      }
      return FP.pipe(
        getChainBalanceData$(chain),
        liveData.map((balances) => {
          balanceRecord[chain] = RD.success(balances)
          return balances
        }),
        RxOp.startWith(savedResult || RD.initial)
      )
    })
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

const ethBalances$ = getChainBalance$('ETH')
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

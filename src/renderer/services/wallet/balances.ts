import * as RD from '@devexperts/remote-data-ts'
import { AssetBNB, BCHChain, BNBChain, BTCChain, Chain, ETHChain, LTCChain, THORChain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { ETHAssets } from '../../const'
import { getBnbRuneAsset } from '../../helpers/assetHelper'
import { filterEnabledChains } from '../../helpers/chainHelper'
import { eqBalancesRD } from '../../helpers/fp/eq'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { Network$ } from '../app/types'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import * as BCH from '../bitcoincash'
import { WalletBalancesLD, WalletBalancesRD } from '../clients'
import * as ETH from '../ethereum'
import * as LTC from '../litecoin'
import * as THOR from '../thorchain'
import { INITIAL_BALANCES_STATE } from './const'
import {
  ChainBalances$,
  ChainBalance$,
  BalancesService,
  ChainBalancesService,
  BalancesState$,
  KeystoreState$,
  KeystoreState,
  ChainBalance
} from './types'
import { sortBalances } from './util'
import { hasImportedKeystore } from './util'

export const createBalancesService = ({
  keystore$,
  network$
}: {
  keystore$: KeystoreState$
  network$: Network$
}): BalancesService => {
  const reloadBalances: FP.Lazy<void> = () => {
    BTC.reloadBalances()
    BNB.reloadBalances()
    ETH.reloadBalances()
    THOR.reloadBalances()
    LTC.reloadBalances()
    BCH.reloadBalances()
  }

  const getServiceByChain = (chain: Chain): ChainBalancesService => {
    switch (chain) {
      case BNBChain:
        return {
          reloadBalances: BNB.reloadBalances,
          resetReloadBalances: BNB.resetReloadBalances,
          balances$: FP.pipe(
            network$,
            RxOp.switchMap((network) => BNB.balances$(network))
          ),
          reloadBalances$: BNB.reloadBalances$
        }
      case BTCChain:
        return {
          reloadBalances: BTC.reloadBalances,
          resetReloadBalances: BTC.resetReloadBalances,
          balances$: BTC.balances$,
          reloadBalances$: BTC.reloadBalances$
        }
      case BCHChain:
        return {
          reloadBalances: BCH.reloadBalances,
          resetReloadBalances: BCH.resetReloadBalances,
          balances$: BCH.balances$,
          reloadBalances$: BCH.reloadBalances$
        }
      case ETHChain:
        return {
          reloadBalances: ETH.reloadBalances,
          resetReloadBalances: ETH.resetReloadBalances,
          balances$: FP.pipe(
            network$,
            RxOp.switchMap((network) => ETH.balances$(network === 'testnet' ? ETHAssets : undefined))
          ),
          reloadBalances$: ETH.reloadBalances$
        }
      case THORChain:
        return {
          reloadBalances: THOR.reloadBalances,
          resetReloadBalances: THOR.resetReloadBalances,
          balances$: THOR.balances$,
          reloadBalances$: THOR.reloadBalances$
        }
      case LTCChain:
        return {
          reloadBalances: LTC.reloadBalances,
          resetReloadBalances: LTC.resetReloadBalances,
          balances$: LTC.balances$,
          reloadBalances$: LTC.reloadBalances$
        }
      default:
        return {
          reloadBalances: FP.constVoid,
          resetReloadBalances: FP.constVoid,
          balances$: Rx.EMPTY,
          reloadBalances$: Rx.EMPTY
        }
    }
  }

  const reloadBalancesByChain: (chain: Chain) => FP.Lazy<void> = (chain) => {
    return getServiceByChain(chain).reloadBalances
  }

  /**
   * Store previously successfully loaded results at the runtime-memory
   * to give to the user last balances he loaded without re-requesting
   * balances data which might be very expensive.
   */
  let walletBalancesState: Partial<Record<Chain, WalletBalancesRD>> = {}

  // Whenever network is changed, reset stored balances
  const networkSub = network$.subscribe(() => {
    walletBalancesState = {}
  })

  // Whenever keystore has been removed, reset stored balances
  const keystoreSub = keystore$.subscribe((keystoreState: KeystoreState) => {
    if (!hasImportedKeystore(keystoreState)) {
      walletBalancesState = {}
    }
  })

  const getChainBalance$ = (chain: Chain): WalletBalancesLD => {
    const chainService = getServiceByChain(chain)
    const reload$ = FP.pipe(
      chainService.reloadBalances$,
      RxOp.finalize(() => {
        // on finish a stream reset reload-trigger
        // unsubscribe will be initiated on any View unmount
        chainService.resetReloadBalances()
      })
    )

    return FP.pipe(
      reload$,
      RxOp.switchMap((shouldReloadData) => {
        const savedResult = walletBalancesState[chain]
        // For every new simple subscription return cached results if they exist
        if (!shouldReloadData && savedResult) {
          return Rx.of(savedResult)
        }
        // If there is no cached data for appropriate chain request for it
        // Re-request data ONLY for manual calling update trigger with `trigger`
        // value inside of trigger$ stream
        return FP.pipe(
          chainService.balances$,
          // For every successful load save results to the memory-based cache
          // to avoid unwanted data re-requesting.
          liveData.map((balances) => {
            walletBalancesState[chain] = RD.success(balances)
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
  const thorChainBalance$: ChainBalance$ = Rx.combineLatest([THOR.addressUI$, getChainBalance$(THORChain)]).pipe(
    RxOp.map(([walletAddress, balances]) => ({
      walletType: 'keystore',
      chain: THORChain,
      walletAddress,
      balances
    }))
  )

  const thorLedgerChainBalance$: ChainBalance$ = FP.pipe(
    THOR.ledgerAddress$,
    RxOp.switchMap((addressRd) =>
      FP.pipe(
        addressRd,
        RD.map((address) => THOR.getBalanceByAddress$(address, 'ledger')),
        RD.map(
          RxOp.map<WalletBalancesRD, ChainBalance>((balances) => ({
            walletType: 'ledger',
            chain: THORChain,
            walletAddress: FP.pipe(addressRd, RD.toOption),
            balances
          }))
        ),
        RD.getOrElse(() =>
          Rx.of<ChainBalance>({
            walletType: 'ledger',
            chain: THORChain,
            walletAddress: O.none,
            balances: RD.initial
          })
        )
      )
    ),
    RxOp.shareReplay(1)
  )

  /**
   * Transforms LTC balances into `ChainBalances`
   */
  const litecoinBalance$: ChainBalance$ = Rx.combineLatest([LTC.addressUI$, getChainBalance$(LTCChain)]).pipe(
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
  const bchChainBalance$: ChainBalance$ = Rx.combineLatest([BCH.addressUI$, getChainBalance$(BCHChain)]).pipe(
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
  const bnbChainBalance$: ChainBalance$ = Rx.combineLatest([BNB.addressUI$, getChainBalance$(BNBChain), network$]).pipe(
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
  const btcChainBalance$: ChainBalance$ = Rx.combineLatest([BTC.addressUI$, getChainBalance$(BTCChain)]).pipe(
    RxOp.map(([walletAddress, balances]) => ({
      walletType: 'keystore',
      chain: BTCChain,
      walletAddress,
      balances
    }))
  )

  const ethBalances$ = getChainBalance$(ETHChain)

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
  const chainBalances$: ChainBalances$ = Rx.combineLatest(
    filterEnabledChains({
      THOR: [thorChainBalance$, thorLedgerChainBalance$],
      BTC: [btcChainBalance$],
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
  const balancesState$: BalancesState$ = Rx.combineLatest(
    filterEnabledChains({
      THOR: [getChainBalance$(THORChain)],
      BTC: [getChainBalance$(BTCChain)],
      BCH: [getChainBalance$(BCHChain)],
      ETH: [ethBalances$],
      BNB: [getChainBalance$(BNBChain)],
      LTC: [getChainBalance$(LTCChain)]
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

  /**
   * Dispose references / subscriptions (if needed)
   */
  const dispose = () => {
    networkSub.unsubscribe()
    keystoreSub.unsubscribe()
    walletBalancesState = {}
  }

  return {
    reloadBalances,
    reloadBalancesByChain,
    chainBalances$,
    balancesState$,
    dispose
  }
}

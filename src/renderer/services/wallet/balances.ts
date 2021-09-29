import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { AssetBNB, BCHChain, BNBChain, BTCChain, Chain, ETHChain, LTCChain, THORChain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
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
  ChainBalance,
  LedgerAddressLD,
  WalletType
} from './types'
import { sortBalances } from './util'
import { hasImportedKeystore } from './util'

export const createBalancesService = ({
  keystore$,
  network$,
  getLedgerAddress$,
  getWalletIndex$
}: {
  keystore$: KeystoreState$
  network$: Network$
  getLedgerAddress$: (chain: Chain, network: Network) => LedgerAddressLD
  getWalletIndex$: (chain: Chain) => Rx.Observable<number>
}): BalancesService => {
  // reload all balances
  const reloadBalances: FP.Lazy<void> = () => {
    BNB.reloadBalances()
    BTC.reloadBalances()
    BCH.reloadBalances()
    ETH.reloadBalances()
    THOR.reloadBalances()
    LTC.reloadBalances()
  }

  // Returns lazy functions to reload balances by given chain
  const reloadBalancesByChain = (chain: Chain) => {
    switch (chain) {
      case BNBChain:
        return BNB.reloadBalances
      case BTCChain:
        return BTC.reloadBalances
      case BCHChain:
        return BCH.reloadBalances
      case ETHChain:
        return ETH.reloadBalances
      case THORChain:
        return THOR.reloadBalances
      case LTCChain:
        return LTC.reloadBalances
      default:
        return FP.constVoid
    }
  }

  const getServiceByChain = (chain: Chain, walletType: WalletType, walletIndex: number): ChainBalancesService => {
    switch (chain) {
      case BNBChain:
        return {
          reloadBalances: BNB.reloadBalances,
          resetReloadBalances: BNB.resetReloadBalances,
          balances$: FP.pipe(
            network$,
            RxOp.switchMap((network) => BNB.balances$(walletType, network, walletIndex))
          ),
          reloadBalances$: BNB.reloadBalances$
        }
      case BTCChain:
        return {
          reloadBalances: BTC.reloadBalances,
          resetReloadBalances: BTC.resetReloadBalances,
          balances$: BTC.balances$(walletType),
          reloadBalances$: BTC.reloadBalances$
        }
      case BCHChain:
        return {
          reloadBalances: BCH.reloadBalances,
          resetReloadBalances: BCH.resetReloadBalances,
          balances$: BCH.balances$(walletType),
          reloadBalances$: BCH.reloadBalances$
        }
      case ETHChain:
        return {
          reloadBalances: ETH.reloadBalances,
          resetReloadBalances: ETH.resetReloadBalances,
          balances$: FP.pipe(
            network$,
            RxOp.switchMap((network) => ETH.balances$(walletType, network === 'testnet' ? ETHAssets : undefined))
          ),
          reloadBalances$: ETH.reloadBalances$
        }
      case THORChain:
        return {
          reloadBalances: THOR.reloadBalances,
          resetReloadBalances: THOR.resetReloadBalances,
          balances$: THOR.balances$(walletType),
          reloadBalances$: THOR.reloadBalances$
        }
      case LTCChain:
        return {
          reloadBalances: LTC.reloadBalances,
          resetReloadBalances: LTC.resetReloadBalances,
          balances$: LTC.balances$(walletType),
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

  /**
   * Store previously successfully loaded results at the runtime-memory
   * to give to the user last balances he loaded without re-requesting
   * balances data which might be very expensive.
   */
  const walletBalancesState: Map<{ chain: Chain; walletType: WalletType }, WalletBalancesRD> = new Map()

  // Whenever network is changed, reset stored balances
  const networkSub = network$.subscribe(() => {
    walletBalancesState.clear()
  })

  // Whenever keystore has been removed, reset stored balances
  const keystoreSub = keystore$.subscribe((keystoreState: KeystoreState) => {
    if (!hasImportedKeystore(keystoreState)) {
      walletBalancesState.clear()
    }
  })

  const getChainBalance$ = (chain: Chain, walletType: WalletType, walletIndex = 0): WalletBalancesLD => {
    const chainService = getServiceByChain(chain, walletType, walletIndex)
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
      // chainService.reloadBalances$,
      RxOp.switchMap((shouldReloadData) => {
        const savedResult = walletBalancesState.get({ chain, walletType })
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
            walletBalancesState.set({ chain, walletType }, RD.success(balances))
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
  const thorChainBalance$: ChainBalance$ = Rx.combineLatest([
    THOR.addressUI$,
    getChainBalance$(THORChain, 'keystore')
  ]).pipe(
    RxOp.map(([walletAddress, balances]) => ({
      walletType: 'keystore',
      chain: THORChain,
      walletAddress,
      balances
    }))
  )

  /**
   * Factory to create a stream of ledger balances by given chain
   */
  const ledgerChainBalance$ = (
    chain: Chain,
    getBalanceByAddress$: (address: Address, walletType: WalletType) => WalletBalancesLD
  ): ChainBalance$ =>
    FP.pipe(
      network$,
      RxOp.switchMap((network) => getLedgerAddress$(chain, network)),
      RxOp.switchMap((addressRD) =>
        FP.pipe(
          addressRD,
          RD.toOption,
          O.fold(
            () =>
              // In case we don't get an address,
              // just return `ChainBalance` w/ initial (empty) balances
              Rx.of<ChainBalance>({
                walletType: 'ledger',
                walletIndex: 0,
                chain,
                walletAddress: O.none,
                balances: RD.initial
              }),
            (address) =>
              // Load balances by given Ledger address
              // and put it's RD state into `balances` of `ChainBalance`
              FP.pipe(
                Rx.combineLatest([getBalanceByAddress$(address, 'ledger'), getWalletIndex$(chain)]),
                RxOp.map<[WalletBalancesRD, number], ChainBalance>(([balances, walletIndex]) => ({
                  walletType: 'ledger',
                  walletIndex,
                  chain,
                  walletAddress: O.some(address),
                  balances
                }))
              )
          )
        )
      )
    )

  /**
   * THOR Ledger balances
   */
  const thorLedgerChainBalance$: ChainBalance$ = ledgerChainBalance$(THORChain, THOR.getBalanceByAddress$)

  /**
   * Transforms LTC balances into `ChainBalances`
   */
  const litecoinBalance$: ChainBalance$ = Rx.combineLatest([
    LTC.addressUI$,
    getChainBalance$(LTCChain, 'keystore')
  ]).pipe(
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
  const bchChainBalance$: ChainBalance$ = Rx.combineLatest([
    BCH.addressUI$,
    getChainBalance$(BCHChain, 'keystore')
  ]).pipe(
    RxOp.map(([walletAddress, balances]) => ({
      walletType: 'keystore',
      chain: BCHChain,
      walletAddress,
      balances
    }))
  )

  /**
   * BNB Ledger balances
   */
  const bnbLedgerChainBalance$: ChainBalance$ = ledgerChainBalance$(BNBChain, BNB.getBalanceByAddress$)

  /**
   * Transforms BNB balances into `ChainBalances`
   */
  const bnbChainBalance$: ChainBalance$ = Rx.combineLatest([
    BNB.addressUI$,
    getChainBalance$(BNBChain, 'keystore'),
    network$
  ]).pipe(
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
  const btcChainBalance$: ChainBalance$ = Rx.combineLatest([
    BTC.addressUI$,
    getChainBalance$(BTCChain, 'keystore')
  ]).pipe(
    RxOp.map(([walletAddress, balances]) => ({
      walletType: 'keystore',
      chain: BTCChain,
      walletAddress,
      balances
    }))
  )

  const ethBalances$ = getChainBalance$(ETHChain, 'keystore')

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
  const chainBalances$: ChainBalances$ = FP.pipe(
    Rx.combineLatest(
      filterEnabledChains({
        THOR: [thorChainBalance$, thorLedgerChainBalance$],
        BTC: [btcChainBalance$],
        BCH: [bchChainBalance$],
        ETH: [ethChainBalance$],
        BNB: [bnbChainBalance$, bnbLedgerChainBalance$],
        LTC: [litecoinBalance$]
      })
    ),
    // we ignore all `ChainBalances` with state of `initial` balances
    // (e.g. a not connected Ledger )
    RxOp.map(A.filter(({ balances }) => !RD.isInitial(balances))),
    RxOp.shareReplay(1)
  )

  /**
   * Transform a list of BalancesLD
   * into a "single" state of `BalancesState`
   * to provide loading / error / data states of nested `balances` in a single "state" object
   *
   * Note: Empty list of balances won't be included in `BalancesState`!!
   */
  const balancesState$: BalancesState$ = FP.pipe(
    chainBalances$,
    RxOp.map((chainBalances) => ({
      balances: FP.pipe(
        chainBalances,
        // filter results out
        // Transformation: RD<ApiError, WalletBalances>[]`-> `WalletBalances[]`
        A.filterMap(({ balances }) => RD.toOption(balances)),
        A.flatten,
        NEA.fromArray
      ),
      loading: FP.pipe(
        chainBalances,
        // get list of balances
        A.map(({ balances }) => balances),
        A.elem(eqBalancesRD)(RD.pending)
      ),
      errors: FP.pipe(
        chainBalances,
        // get list of balances
        A.map(({ balances }) => balances),
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
    walletBalancesState.clear()
  }

  return {
    reloadBalances,
    reloadBalancesByChain,
    chainBalances$,
    balancesState$,
    dispose
  }
}

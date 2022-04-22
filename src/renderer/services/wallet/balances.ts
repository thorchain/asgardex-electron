import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import {
  AssetBNB,
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  TerraChain,
  PolkadotChain,
  THORChain
} from '@xchainjs/xchain-util'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { WalletAddress, WalletBalanceType, WalletType } from '../../../shared/wallet/types'
import { getBnbRuneAsset } from '../../helpers/assetHelper'
import { filterEnabledChains } from '../../helpers/chainHelper'
import { eqBalancesRD } from '../../helpers/fp/eq'
import { sequenceTOptionFromArray } from '../../helpers/fpHelpers'
import { liveData } from '../../helpers/rx/liveData'
import { addressFromOptionalWalletAddress } from '../../helpers/walletHelper'
import { Network$ } from '../app/types'
import * as BNB from '../binance'
import * as BTC from '../bitcoin'
import * as BCH from '../bitcoincash'
import { WalletBalancesLD, WalletBalancesRD } from '../clients'
import * as DOGE from '../doge'
import * as ETH from '../ethereum'
import * as LTC from '../litecoin'
import * as TERRA from '../terra'
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
  GetLedgerAddressHandler
} from './types'
import { sortBalances } from './util'
import { hasImportedKeystore } from './util'

export const createBalancesService = ({
  keystore$,
  network$,
  getLedgerAddress$
}: {
  keystore$: KeystoreState$
  network$: Network$
  getLedgerAddress$: GetLedgerAddressHandler
}): BalancesService => {
  // reload all balances
  const reloadBalances: FP.Lazy<void> = () => {
    BNB.reloadBalances()
    BTC.reloadBalances()
    BCH.reloadBalances()
    ETH.reloadBalances()
    THOR.reloadBalances()
    LTC.reloadBalances()
    DOGE.reloadBalances()
    TERRA.reloadBalances()
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
      case DOGEChain:
        return DOGE.reloadBalances
      case TerraChain:
        return TERRA.reloadBalances
      case CosmosChain:
        return FP.constVoid
      case PolkadotChain:
        return FP.constVoid
    }
  }

  const getBalancesServiceByChain = ({
    chain,
    walletType,
    walletIndex,
    walletBalanceType
  }: {
    chain: Chain
    walletType: WalletType
    walletIndex: number
    walletBalanceType: WalletBalanceType
  }): ChainBalancesService => {
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
          balances$: BTC.balances$(walletType, walletIndex, walletBalanceType),
          reloadBalances$: BTC.reloadBalances$
        }
      case BCHChain:
        return {
          reloadBalances: BCH.reloadBalances,
          resetReloadBalances: BCH.resetReloadBalances,
          balances$: BCH.balances$(walletType, walletIndex),
          reloadBalances$: BCH.reloadBalances$
        }
      case ETHChain:
        return {
          reloadBalances: ETH.reloadBalances,
          resetReloadBalances: ETH.resetReloadBalances,
          balances$: FP.pipe(
            network$,
            RxOp.switchMap((network) => ETH.balances$({ walletType, network, walletIndex }))
          ),
          reloadBalances$: ETH.reloadBalances$
        }
      case THORChain:
        return {
          reloadBalances: THOR.reloadBalances,
          resetReloadBalances: THOR.resetReloadBalances,
          balances$: THOR.balances$(walletType, walletIndex),
          reloadBalances$: THOR.reloadBalances$
        }
      case LTCChain:
        return {
          reloadBalances: LTC.reloadBalances,
          resetReloadBalances: LTC.resetReloadBalances,
          balances$: LTC.balances$(walletType, walletIndex),
          reloadBalances$: LTC.reloadBalances$
        }
      case DOGEChain:
        return {
          reloadBalances: DOGE.reloadBalances,
          resetReloadBalances: DOGE.resetReloadBalances,
          balances$: DOGE.balances$(walletType, walletIndex),
          reloadBalances$: DOGE.reloadBalances$
        }
      case TerraChain:
        return {
          reloadBalances: TERRA.reloadBalances,
          resetReloadBalances: TERRA.resetReloadBalances,
          balances$: TERRA.balances$(walletType, walletIndex),
          reloadBalances$: TERRA.reloadBalances$
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
  const walletBalancesState: Map<
    { chain: Chain; walletType: WalletType; walletBalanceType: WalletBalanceType },
    WalletBalancesRD
  > = new Map()

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

  const getChainBalance$ = ({
    chain,
    walletType,
    walletIndex,
    walletBalanceType
  }: {
    chain: Chain
    walletType: WalletType
    walletIndex: number
    walletBalanceType: WalletBalanceType
  }): WalletBalancesLD => {
    const chainService = getBalancesServiceByChain({ chain, walletType, walletIndex, walletBalanceType })
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
        const savedResult = walletBalancesState.get({ chain, walletType, walletBalanceType })
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
            walletBalancesState.set({ chain, walletType, walletBalanceType }, RD.success(balances))
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
    getChainBalance$({ chain: THORChain, walletType: 'keystore', walletIndex: 0, walletBalanceType: 'all' }) // walletIndex=0 (as long as we don't support HD wallets for keystore)
  ]).pipe(
    RxOp.map(([oWalletAddress, balances]) => ({
      walletType: 'keystore',
      chain: THORChain,
      walletAddress: addressFromOptionalWalletAddress(oWalletAddress),
      walletIndex: 0, // Always 0 as long as we don't support HD wallets for keystore
      balances,
      balancesType: 'all'
    }))
  )

  /**
   * Factory to create a stream of ledger balances by given chain
   */
  const ledgerChainBalance$ = ({
    chain,
    walletBalanceType,
    getBalanceByAddress$
  }: {
    chain: Chain
    walletBalanceType: WalletBalanceType
    getBalanceByAddress$: ({
      address,
      walletType,
      walletIndex,
      walletBalanceType
    }: {
      address: Address
      walletType: WalletType
      walletIndex: number
      walletBalanceType: WalletBalanceType
    }) => WalletBalancesLD
  }): ChainBalance$ =>
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
                chain,
                walletAddress: O.none,
                balances: RD.initial,
                walletIndex: 0,
                balancesType: walletBalanceType
              }),
            ({ address, walletIndex }) =>
              // Load balances by given Ledger address
              // and put it's RD state into `balances` of `ChainBalance`
              FP.pipe(
                getBalanceByAddress$({ address, walletType: 'ledger', walletIndex, walletBalanceType }),
                RxOp.map<WalletBalancesRD, ChainBalance>((balances) => ({
                  walletType: 'ledger',
                  walletIndex,
                  chain,
                  walletAddress: O.some(address),
                  balances,
                  balancesType: walletBalanceType
                }))
              )
          )
        )
      )
    )

  /**
   * THOR Ledger balances
   */
  const thorLedgerChainBalance$: ChainBalance$ = ledgerChainBalance$({
    chain: THORChain,
    walletBalanceType: 'all',
    getBalanceByAddress$: THOR.getBalanceByAddress$
  })

  /**
   * Transforms LTC balances into `ChainBalances`
   */
  const ltcBalance$: ChainBalance$ = Rx.combineLatest([
    LTC.addressUI$,
    getChainBalance$({ chain: LTCChain, walletType: 'keystore', walletIndex: 0, walletBalanceType: 'all' }) // walletIndex=0 (as long as we don't support HD wallets for keystore)
  ]).pipe(
    RxOp.map<[O.Option<WalletAddress>, WalletBalancesRD], ChainBalance>(([oWalletAddress, balances]) => ({
      walletType: 'keystore',
      chain: LTCChain,
      walletAddress: addressFromOptionalWalletAddress(oWalletAddress),
      walletIndex: 0, // Always 0 as long as we don't support HD wallets for keystore for keystore
      balances,
      balancesType: 'all'
    }))
  )

  /**
   * LTC Ledger balances
   */
  const ltcLedgerChainBalance$: ChainBalance$ = ledgerChainBalance$({
    chain: LTCChain,
    walletBalanceType: 'all',
    getBalanceByAddress$: LTC.getBalanceByAddress$
  })

  /**
   * Transforms BCH balances into `ChainBalances`
   */
  const bchChainBalance$: ChainBalance$ = Rx.combineLatest([
    BCH.addressUI$,
    getChainBalance$({ chain: BCHChain, walletType: 'keystore', walletIndex: 0, walletBalanceType: 'all' }) // walletIndex=0 (as long as we don't support HD wallets for keystore)
  ]).pipe(
    RxOp.map<[O.Option<WalletAddress>, WalletBalancesRD], ChainBalance>(([oWalletAddress, balances]) => ({
      walletType: 'keystore',
      chain: BCHChain,
      walletAddress: addressFromOptionalWalletAddress(oWalletAddress),
      walletIndex: 0, // Always 0 as long as we don't support HD wallets for keystore
      balances,
      balancesType: 'all'
    }))
  )

  /**
   * BCH Ledger balances
   */
  const bchLedgerChainBalance$: ChainBalance$ = ledgerChainBalance$({
    chain: BCHChain,
    walletBalanceType: 'all',
    getBalanceByAddress$: BCH.getBalanceByAddress$
  })

  /**
   * BNB Ledger balances
   */
  const bnbLedgerChainBalance$: ChainBalance$ = ledgerChainBalance$({
    chain: BNBChain,
    walletBalanceType: 'all',
    getBalanceByAddress$: BNB.getBalanceByAddress$
  })

  /**
   * Transforms BNB balances into `ChainBalances`
   */
  const bnbChainBalance$: ChainBalance$ = Rx.combineLatest([
    BNB.addressUI$,
    getChainBalance$({ chain: BNBChain, walletType: 'keystore', walletIndex: 0, walletBalanceType: 'all' }), // walletIndex=0 (as long as we don't support HD wallets for keystore)
    network$
  ]).pipe(
    RxOp.map<[O.Option<WalletAddress>, WalletBalancesRD, Network], ChainBalance>(
      ([oWalletAddress, balances, network]) => ({
        walletType: 'keystore',
        chain: BNBChain,
        walletAddress: addressFromOptionalWalletAddress(oWalletAddress),
        walletIndex: 0, // Always 0 as long as we don't support HD wallets for keystore
        balances: FP.pipe(
          balances,
          RD.map((assets) => sortBalances(assets, [AssetBNB.ticker, getBnbRuneAsset(network).ticker]))
        ),
        balancesType: 'all'
      })
    )
  )

  /**
   * BTC Ledger balances
   */
  const btcLedgerChainBalance$: ChainBalance$ = ledgerChainBalance$({
    chain: BTCChain,
    walletBalanceType: 'all',
    getBalanceByAddress$: BTC.getBalanceByAddress$('all')
  })
  /**
   * BTC Ledger confirmed balances
   */
  const btcLedgerChainBalanceConfirmed$: ChainBalance$ = ledgerChainBalance$({
    chain: BTCChain,
    walletBalanceType: 'confirmed',
    getBalanceByAddress$: BTC.getBalanceByAddress$('confirmed')
  })

  /**
   * Transforms BTC balances into `ChainBalance`
   */
  const btcChainBalance$: ChainBalance$ = Rx.combineLatest([
    BTC.addressUI$,
    getChainBalance$({ chain: BTCChain, walletType: 'keystore', walletIndex: 0, walletBalanceType: 'all' }) // walletIndex=0 (as long as we don't support HD wallets for keystore)
  ]).pipe(
    RxOp.map<[O.Option<WalletAddress>, WalletBalancesRD], ChainBalance>(([oWalletAddress, balances]) => ({
      walletType: 'keystore',
      chain: BTCChain,
      walletAddress: addressFromOptionalWalletAddress(oWalletAddress),
      walletIndex: 0, // Always 0 as long as we don't support HD wallets for keystore
      balances,
      balancesType: 'all'
    }))
  )
  /**
   * Transforms BTC balances into `ChainBalance`
   */
  const btcChainBalanceConfirmed$: ChainBalance$ = Rx.combineLatest([
    BTC.addressUI$,
    getChainBalance$({ chain: BTCChain, walletType: 'keystore', walletIndex: 0, walletBalanceType: 'confirmed' }) // walletIndex=0 (as long as we don't support HD wallets for keystore)
  ]).pipe(
    RxOp.map<[O.Option<WalletAddress>, WalletBalancesRD], ChainBalance>(([oWalletAddress, balances]) => ({
      walletType: 'keystore',
      chain: BTCChain,
      walletAddress: addressFromOptionalWalletAddress(oWalletAddress),
      walletIndex: 0, // Always 0 as long as we don't support HD wallets for keystore
      balances,
      balancesType: 'confirmed'
    }))
  )

  /**
   * Transforms DOGE balances into `ChainBalance`
   */
  const dogeChainBalance$: ChainBalance$ = Rx.combineLatest([
    DOGE.addressUI$,
    getChainBalance$({ chain: DOGEChain, walletType: 'keystore', walletIndex: 0, walletBalanceType: 'all' }) // walletIndex=0 (as long as we don't support HD wallets for keystore)
  ]).pipe(
    RxOp.map<[O.Option<WalletAddress>, WalletBalancesRD], ChainBalance>(([oWalletAddress, balances]) => ({
      walletType: 'keystore',
      chain: DOGEChain,
      walletAddress: addressFromOptionalWalletAddress(oWalletAddress),
      walletIndex: 0, // Always 0 as long as we don't support HD wallets for keystore
      balances,
      balancesType: 'all'
    }))
  )

  /**
   * DOGE Ledger balances
   */
  const dogeLedgerChainBalance$: ChainBalance$ = ledgerChainBalance$({
    chain: DOGEChain,
    walletBalanceType: 'all',
    getBalanceByAddress$: DOGE.getBalanceByAddress$
  })

  const ethBalances$ = getChainBalance$({
    chain: ETHChain,
    walletType: 'keystore',
    walletIndex: 0,
    walletBalanceType: 'all'
  }) // walletIndex=0 (as long as we don't support HD wallets for keystore)

  /**
   * Transforms ETH data (address + `WalletBalance`) into `ChainBalance`
   */
  const ethChainBalance$: ChainBalance$ = Rx.combineLatest([ETH.addressUI$, ethBalances$]).pipe(
    RxOp.map<[O.Option<WalletAddress>, WalletBalancesRD], ChainBalance>(([oWalletAddress, balances]) => ({
      walletType: 'keystore',
      chain: ETHChain,
      walletAddress: addressFromOptionalWalletAddress(oWalletAddress),
      walletIndex: 0, // Always 0 as long as we don't support HD wallets for keystore
      balances,
      balancesType: 'all'
    }))
  )

  /**
   * Transforms TERRA balances into `ChainBalance`
   */
  const terraChainBalance$: ChainBalance$ = Rx.combineLatest([
    TERRA.addressUI$,
    getChainBalance$({ chain: TerraChain, walletType: 'keystore', walletIndex: 0, walletBalanceType: 'all' }) // walletIndex=0 (as long as we don't support HD wallets for keystore)
  ]).pipe(
    RxOp.map<[O.Option<WalletAddress>, WalletBalancesRD], ChainBalance>(([oWalletAddress, balances]) => ({
      walletType: 'keystore',
      chain: TerraChain,
      walletAddress: addressFromOptionalWalletAddress(oWalletAddress),
      walletIndex: 0, // Always 0 as long as we don't support HD wallets for keystore
      balances,
      balancesType: 'all'
    }))
  )

  /**
   * Terra Ledger balances
   */
  const terraLedgerChainBalance$: ChainBalance$ = ledgerChainBalance$({
    chain: TerraChain,
    walletBalanceType: 'all',
    getBalanceByAddress$: TERRA.getBalanceByAddress$
  })

  /**
   * List of `ChainBalances` for all available chains (order is important)
   *
   * It includes keystore + Ledger balances
   * For BTC only: Plus `confirmed` balances
   */
  const chainBalances$: ChainBalances$ = FP.pipe(
    Rx.combineLatest(
      filterEnabledChains({
        THOR: [thorChainBalance$, thorLedgerChainBalance$],
        // for BTC we store `confirmed` or `all` (confirmed + unconfirmed) balances
        BTC: [btcChainBalance$, btcChainBalanceConfirmed$, btcLedgerChainBalance$, btcLedgerChainBalanceConfirmed$],
        BCH: [bchChainBalance$, bchLedgerChainBalance$],
        ETH: [ethChainBalance$],
        BNB: [bnbChainBalance$, bnbLedgerChainBalance$],
        LTC: [ltcBalance$, ltcLedgerChainBalance$],
        DOGE: [dogeChainBalance$, dogeLedgerChainBalance$],
        TERRA: [terraChainBalance$, terraLedgerChainBalance$]
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
   * @param {BalancesStateFilter} filter Options to filter balances by `walletBalancesType`
   *
   * Note: Empty list of balances won't be included in `BalancesState`
   */
  const balancesState$: BalancesState$ = (filter) =>
    FP.pipe(
      chainBalances$,
      RxOp.map((chainBalances) => ({
        balances: FP.pipe(
          chainBalances,
          // filter balances by given `filter`
          A.filter(({ balancesType, chain }) => {
            if (filter[chain]) return balancesType === filter[chain]

            return true
          }),
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

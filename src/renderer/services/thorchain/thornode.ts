import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative, assetToString, baseAmount, isChain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/PathReporter'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { LiveData, liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { Configuration, MimirApi, NetworkApi, Node, NodesApi, Pool, PoolsApi } from '../../types/generated/thornode'
import { Network$ } from '../app/types'
import {
  MimirIO,
  MimirLD,
  ThornodeApiUrlLD,
  LiquidityProviderIO,
  LiquidityProvidersLD,
  LiquidityProvider,
  NodeInfosLD,
  NodeInfos,
  ClientUrl$,
  InboundAddressesLD
} from './types'

export const createThornodeService$ = (network$: Network$, clientUrl$: ClientUrl$) => {
  // `TriggerStream` to reload THORNode url
  const { stream$: reloadThornodeUrl$, trigger: reloadThornodeUrl } = triggerStream()

  /**
   * Thornode url
   */
  const thornodeUrl$: ThornodeApiUrlLD = Rx.combineLatest([network$, clientUrl$, reloadThornodeUrl$]).pipe(
    RxOp.map(([network, url, _]) => RD.success(`${url[network].node}`)),
    RxOp.shareReplay(1)
  )

  const apiGetNodeInfos$ = () =>
    FP.pipe(
      thornodeUrl$,
      liveData.chain((basePath) =>
        FP.pipe(
          new NodesApi(new Configuration({ basePath })).nodes({ height: undefined }),
          RxOp.map(RD.success),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      ),
      RxOp.startWith(RD.pending)
    )

  const loadInboundAddresses$ = (): InboundAddressesLD =>
    FP.pipe(
      thornodeUrl$,
      liveData.chain((basePath) =>
        FP.pipe(
          new NetworkApi(new Configuration({ basePath })).inboundAddresses({}),
          RxOp.map(RD.success),
          liveData.map(
            FP.flow(
              A.filterMap(({ chain, address, ...rest }) =>
                // validate chain
                chain !== undefined &&
                isChain(chain) &&
                // address is required
                !!address
                  ? O.some({ chain, address, ...rest })
                  : O.none
              )
            )
          ),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      ),
      RxOp.startWith(RD.pending)
    )

  // Trigger to reload pool addresses (`inbound_addresses`)
  const { stream$: reloadInboundAddresses$, trigger: reloadInboundAddresses } = triggerStream()
  const inboundAddressesInterval$ = Rx.timer(0 /* no delay for first value */, 5 * 60 * 1000 /* delay of 5 min  */)

  /**
   * Get's inbound addresses once and share result by next subscription
   *
   * It will be updated using a timer defined in `inboundAddressesInterval`
   * or by reloading of data possible by `reloadInboundAddresses`
   */
  const inboundAddressesShared$: InboundAddressesLD = FP.pipe(
    Rx.combineLatest([reloadInboundAddresses$, inboundAddressesInterval$]),
    // debounce it, reloadInboundAddresses might be called by UI many times
    RxOp.debounceTime(300),
    RxOp.switchMap((_) => loadInboundAddresses$()),
    RxOp.shareReplay(1)
  )

  const { stream$: reloadNodeInfos$, trigger: reloadNodeInfos } = triggerStream()

  const getNodeInfos$: NodeInfosLD = FP.pipe(
    reloadNodeInfos$,
    RxOp.debounceTime(300),
    RxOp.switchMap(apiGetNodeInfos$),
    liveData.map<Node[], NodeInfos>((nodes) =>
      FP.pipe(
        nodes,
        A.map(({ bond, current_award, status, node_address }) => ({
          bond: baseAmount(bond, THORCHAIN_DECIMAL),
          award: baseAmount(current_award, THORCHAIN_DECIMAL),
          status,
          address: node_address
        }))
      )
    ),
    RxOp.startWith(RD.initial),
    RxOp.shareReplay(1)
  )

  const apiGetLiquidityProviders$ = (asset: Asset): LiveData<Error, Pool> =>
    FP.pipe(
      thornodeUrl$,
      liveData.chain((basePath) =>
        FP.pipe(
          new PoolsApi(new Configuration({ basePath })).pool({ asset: assetToString(asset) }),
          RxOp.map(RD.success),
          RxOp.catchError((e: Error) => Rx.of(RD.failure(e)))
        )
      )
    )

  const { stream$: reloadLiquidityProviders$, trigger: reloadLiquidityProviders } = triggerStream()

  const getLiquidityProviders = (asset: Asset): LiquidityProvidersLD =>
    FP.pipe(
      reloadLiquidityProviders$,
      RxOp.debounceTime(300),
      RxOp.switchMap((_) => apiGetLiquidityProviders$(asset)),
      // We can not use something like t.array(LiquidityProviderIO) as in case if one of elements
      // fails validation the WHOLE array will be processed as failed-validation by io-ts.
      // So we need to validate each elemnt "by-hands" to avoid losing all data 'cuz of 1 element's fail
      // First check - check if we have an array itself at the response
      RxOp.map(t.array(t.unknown).decode),
      RxOp.map(E.fold(() => [], FP.identity)),
      // Secondly - check every response's element with LiquidityProviderIO codec and filter out every failed-validation-element
      RxOp.map(A.filterMap(FP.flow(LiquidityProviderIO.decode, O.fromEither))),
      RxOp.map(RD.success),
      liveData.map(
        // transform LiquidityProviderIO -> LiquidityProvider
        A.map((provider): LiquidityProvider => {
          const pendingRuneAmount = baseAmount(provider.pending_rune, THORCHAIN_DECIMAL)
          /* 1e8 decimal by default, which is default decimal for ALL accets at THORChain  */
          const pendingAssetAmount = baseAmount(provider.pending_asset, THORCHAIN_DECIMAL)
          return {
            runeAddress: provider.rune_address,
            assetAddress: provider.asset_address,
            pendingRune: pendingRuneAmount.gt(0)
              ? O.some({ asset: AssetRuneNative, amount1e8: pendingRuneAmount })
              : O.none,
            pendingAsset: pendingAssetAmount.gt(0)
              ? O.some({ asset: provider.asset, amount1e8: pendingAssetAmount })
              : O.none
          }
        })
      ),
      RxOp.catchError(
        (): LiquidityProvidersLD => Rx.of(RD.failure(Error(`Failed to load info for ${assetToString(asset)} pool`)))
      ),
      RxOp.startWith(RD.pending)
    )

  const apiGetMimir$: MimirLD = FP.pipe(
    thornodeUrl$,
    liveData.chain((basePath) =>
      FP.pipe(
        new MimirApi(new Configuration({ basePath })).mimir({ height: undefined }),
        RxOp.catchError((e) => Rx.of(RD.failure(Error(`Failed loading mimir: ${JSON.stringify(e)}`)))),
        RxOp.map((response) => MimirIO.decode(response)),
        RxOp.map((result) =>
          // Errors -> Error
          E.mapLeft((_: t.Errors) => Error(`Failed loading mimir ${PathReporter.report(result)}`))(result)
        ),
        RxOp.map(RD.fromEither)
      )
    )
  )

  const { stream$: reloadMimir$, trigger: reloadMimir } = triggerStream()

  const mimirInterval$ = Rx.timer(0 /* no delay for first value */, 5 * 60 * 1000 /* others are delayed by 5 min  */)

  const mimir$: MimirLD = FP.pipe(
    Rx.combineLatest([reloadMimir$, mimirInterval$]),
    RxOp.debounceTime(300),
    RxOp.switchMap(() => apiGetMimir$),
    RxOp.startWith(RD.pending),
    RxOp.shareReplay(1)
  )

  return {
    thornodeUrl$,
    reloadThornodeUrl,
    getNodeInfos$,
    reloadNodeInfos,
    inboundAddressesShared$,
    reloadInboundAddresses,
    loadInboundAddresses$,
    mimir$,
    reloadMimir,
    getLiquidityProviders,
    reloadLiquidityProviders
  }
}

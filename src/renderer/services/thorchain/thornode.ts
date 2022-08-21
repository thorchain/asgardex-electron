import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetRuneNative, assetToString, baseAmount } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/PathReporter'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { envOrDefault } from '../../../shared/utils/env'
import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { LiveData, liveData } from '../../helpers/rx/liveData'
import { observableState, triggerStream } from '../../helpers/stateHelper'
import { Configuration, MimirApi, Node, NodesApi, Pool, PoolsApi } from '../../types/generated/thornode'
import { network$ } from '../app/service'
import {
  MimirIO,
  MimirLD,
  ThornodeApiUrlLD,
  LiquidityProviderIO,
  LiquidityProvidersLD,
  LiquidityProvider,
  NodeInfosLD,
  NodeInfos
} from './types'

const {
  get$: getThornodeUrl$,
  get: getThornodeUrl,
  set: _setThornodeUrl
} = observableState<Record<Network, string>>({
  mainnet: envOrDefault(process.env.REACT_APP_MAINNET_THORNODE_API, 'https://thornode.ninerealms.com'),
  stagenet: envOrDefault(process.env.REACT_APP_STAGENET_THORNODE_API, 'https://stagenet-thornode.ninerealms.com'),
  testnet: envOrDefault(process.env.REACT_APP_TESTNET_THORNODE_API, 'https://testnet.thornode.thorchain.info')
})

// TODO(@veado) #2366
const __setThornodeUrl = (url: string, network: Network) => {
  const current = getThornodeUrl()
  _setThornodeUrl({ ...current, [network]: url })
}

// `TriggerStream` to reload `ThornodeUrl`
// TODO(@veado) #2366
const { stream$: reloadThornodeUrl$, trigger: _reloadThornodeUrl } = triggerStream()

/**
 * Thornode url
 */
const thornodeUrl$: ThornodeApiUrlLD = Rx.combineLatest([network$, getThornodeUrl$, reloadThornodeUrl$]).pipe(
  RxOp.map(([network, url, _]) => RD.success(`${url[network]}`)),
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

export { getNodeInfos$, reloadNodeInfos, mimir$, reloadMimir, getLiquidityProviders, reloadLiquidityProviders }

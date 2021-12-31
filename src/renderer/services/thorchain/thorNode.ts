import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { AssetRuneNative, assetToString, baseAmount } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as t from 'io-ts'
import { PathReporter } from 'io-ts/lib/PathReporter'
import * as Rx from 'rxjs'
import * as RxAjax from 'rxjs/ajax'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { envOrDefault } from '../../../shared/utils/env'
import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { network$ } from '../app/service'
import { ErrorId } from '../wallet/types'
import {
  MimirIO,
  Mimir,
  MimirLD,
  NodeInfoLD,
  NodeStatus,
  ThorNodeApiUrlLD,
  LiquidityProviderIO,
  LiquidityProvidersLD,
  GetLiquidityProvidersParams,
  LiquidityProvider
} from './types'

// Tmp type as ThorNodeApi does not provide valid swagger spec yet
// TODO remove after https://github.com/thorchain/asgardex-electron/issues/763
type NodeInfoResponse = {
  status: string
  bond: string
  current_award: string
}

const getNodeStatusByString = (stringStatus: string): NodeStatus => {
  const lowerCasedStatus = stringStatus.toLowerCase()

  switch (lowerCasedStatus) {
    case 'active': {
      return 'active'
    }
    case 'standby': {
      return 'standby'
    }
    case 'disabled': {
      return 'disabled'
    }
    default: {
      return 'unknown'
    }
  }
}

const { stream$: reloadNodesInfo$, trigger: reloadNodesInfo } = triggerStream()

// Note: We get data from `/thorchain` endpoint !!
const TESTNET_THORNODE_API = `${envOrDefault(
  process.env.REACT_APP_TESTNET_THORNODE_API,
  'https://testnet.thornode.thorchain.info'
)}/thorchain`

// Note: We get data from `/thorchain` endpoint !!
const STAGENET_THORNODE_API = `${envOrDefault(
  process.env.REACT_APP_STAGENET_THORNODE_API,
  'https://stagenet-thornode.ninerealms.com'
)}/thorchain`

// Note: We get data from `/thorchain` endpoint !!
const MAINNET_THORNODE_API = `${envOrDefault(
  process.env.REACT_APP_MAINNET_THORNODE_API,
  'https://thornode.thorchain.info'
)}/thorchain`

const thornodeApiUrl$ = (network: Network): ThorNodeApiUrlLD => {
  // option to set THORNode api url (for testnet + development only)
  let thornodeApi
  switch (network) {
    case 'mainnet':
      thornodeApi = MAINNET_THORNODE_API
      break
    case 'stagenet':
      thornodeApi = STAGENET_THORNODE_API
      break
    case 'testnet':
      thornodeApi = TESTNET_THORNODE_API
      break
  }

  return Rx.of(RD.success(thornodeApi))
}

const getNodeInfo$ = (node: Address, network: Network): NodeInfoLD =>
  FP.pipe(
    reloadNodesInfo$,
    RxOp.debounceTime(300),
    RxOp.switchMap(() => thornodeApiUrl$(network)),
    liveData.chain((url) =>
      FP.pipe(
        RxAjax.ajax(`${url}/node/${node}`),
        RxOp.map(({ response }) => response),
        RxOp.map(RD.success),
        RxOp.startWith(RD.pending),
        RxOp.catchError(() =>
          Rx.of(
            RD.failure({
              errorId: ErrorId.GET_NODE,
              msg: `Failed to load info for ${node}`
            })
          )
        )
      )
    ),
    liveData.map((nodeData: NodeInfoResponse) => ({
      bond: baseAmount(nodeData.bond, THORCHAIN_DECIMAL),
      award: baseAmount(nodeData.current_award, THORCHAIN_DECIMAL),
      status: getNodeStatusByString(nodeData.status)
    })),
    // As we dont have response validation yet just try to handle any issues occured
    RxOp.catchError(() =>
      Rx.of(
        RD.failure({
          errorId: ErrorId.GET_NODE,
          msg: `Failed to load info for ${node}`
        })
      )
    ),
    RxOp.startWith(RD.pending)
  )

const { stream$: reloadLiquidityProviders$, trigger: reloadLiquidityProviders } = triggerStream()

const getLiquidityProviders = ({ asset, network }: GetLiquidityProvidersParams): LiquidityProvidersLD => {
  const poolString = assetToString(asset)
  return FP.pipe(
    reloadLiquidityProviders$,
    RxOp.switchMap(() => thornodeApiUrl$(network)),
    liveData.chain((url) =>
      FP.pipe(
        RxAjax.ajax.getJSON(`${url}/pool/${poolString}/liquidity_providers`),
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
          (): LiquidityProvidersLD =>
            Rx.of(
              RD.failure({
                errorId: ErrorId.GET_LIQUIDITY_PROVIDERS,
                msg: `Failed to load info for ${poolString} pool`
              })
            )
        )
      )
    ),

    RxOp.startWith(RD.pending)
  )
}

const { stream$: reloadMimir$, trigger: reloadMimir } = triggerStream()

const mimirInterval$ = Rx.timer(0 /* no delay for first value */, 5 * 60 * 1000 /* others are delayed by 5 min  */)

const mimir$: MimirLD = FP.pipe(
  Rx.combineLatest([reloadMimir$, mimirInterval$, network$]),
  RxOp.debounceTime(300),
  RxOp.switchMap(([, , network]) => thornodeApiUrl$(network)),
  // ApiError -> Error
  liveData.mapLeft(({ msg }) => Error(msg)),
  liveData.chain((url) =>
    FP.pipe(
      RxAjax.ajax.getJSON<Mimir>(`${url}/mimir`),
      RxOp.map((response) => MimirIO.decode(response)),
      RxOp.map((result) =>
        // Errors -> Error
        E.mapLeft((_: t.Errors) => Error(`Failed loading mimir ${PathReporter.report(result)}`))(result)
      ),
      RxOp.map(RD.fromEither),
      RxOp.catchError((e) => Rx.of(RD.failure(Error(`Failed loading mimir: ${JSON.stringify(e)}`)))),
      RxOp.startWith(RD.pending)
    )
  ),
  RxOp.shareReplay(1)
)

export { getNodeInfo$, reloadNodesInfo, mimir$, reloadMimir, getLiquidityProviders, reloadLiquidityProviders }

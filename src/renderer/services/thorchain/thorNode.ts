import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { Asset, assetToString, baseAmount } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as E from 'fp-ts/lib/Either'
import { Errors } from 'io-ts'
import { PathReporter } from 'io-ts/lib/PathReporter'
import * as Rx from 'rxjs'
import * as RxAjax from 'rxjs/ajax'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { envOrDefault } from '../../helpers/envHelper'
import { LiveData, liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { network$ } from '../app/service'
import { ApiError, ErrorId } from '../wallet/types'
import { MimirIO, Mimir, MimirLD, NodeInfoLD, NodeStatus, ThorNodeApiUrlLD, LiquidityProvidersIO } from './types'

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

const TESTNET_THORNODE_API = envOrDefault(
  process.env.REACT_APP_TESTNET_THORNODE_API,
  'https://testnet.thornode.thorchain.info/thorchain'
)

const MAINNET_THORNODE_API = envOrDefault(
  process.env.REACT_APP_MAINNET_THORNODE_API,
  'https://thornode.thorchain.info/thorchain'
)

const thorNodeApiAddress$ = (network: Network): ThorNodeApiUrlLD => {
  // option to set THORNode api url (for testnet + development only)
  if (network === 'testnet') {
    return Rx.of(RD.success(TESTNET_THORNODE_API))
  }
  return Rx.of(RD.success(MAINNET_THORNODE_API))
}

const getNodeInfo$ = (node: Address, network: Network): NodeInfoLD =>
  FP.pipe(
    reloadNodesInfo$,
    RxOp.debounceTime(300),
    RxOp.switchMap(() => thorNodeApiAddress$(network)),
    liveData.chain((thorApi) =>
      FP.pipe(
        RxAjax.ajax(`${thorApi}/node/${node}`),
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

type LiquidityProvider = {
  asset: Asset
  address?: Address
  pendingRune: string
  pendingAsset: string
  runeDepositValue: string
  assetDepositValue: string
}

type LiquidityProviderLD = LiveData<ApiError, LiquidityProvider[]>

const getLiquidityProviders = (asset: Asset, network: Network): LiquidityProviderLD => {
  const poolString = assetToString(asset)
  return FP.pipe(
    reloadLiquidityProviders$,
    RxOp.switchMap(() => thorNodeApiAddress$(network)),
    liveData.chain((api) =>
      FP.pipe(
        api,
        (thorApi) => RxAjax.ajax.getJSON(`${thorApi}/pool/${poolString}/liquidity_providers`),
        RxOp.map(LiquidityProvidersIO.decode),
        RxOp.switchMap(liveData.fromEither),
        liveData.map(
          A.map((dto) => ({
            asset: dto.asset,
            address: dto.rune_address,
            pendingRune: dto.pending_rune,
            pendingAsset: dto.pending_asset,
            runeDepositValue: dto.rune_deposit_value,
            assetDepositValue: dto.asset_deposit_value
          }))
        ),
        liveData.mapLeft(() => ({
          errorId: ErrorId.GET_LIQUIDITY_PROVIDERS,
          msg: `Failed to load info for ${poolString} pool`
        }))
      )
    ),

    RxOp.startWith(RD.pending)
  )
}

const getLiquidityProvider = (asset: Asset, network: Network) => (walletAddress: Address) =>
  FP.pipe(
    getLiquidityProviders(asset, network),
    liveData.map(A.findFirst((provider) => provider.address === walletAddress))
  )

const { stream$: reloadMimir$, trigger: reloadMimir } = triggerStream()

const mimir$: MimirLD = FP.pipe(
  Rx.combineLatest([network$, reloadMimir$]),
  RxOp.switchMap(([network, _]) => thorNodeApiAddress$(network)),
  // ApiError -> Error
  liveData.mapLeft(({ msg }) => Error(msg)),
  liveData.chain((thorApi) =>
    FP.pipe(
      RxAjax.ajax.getJSON<Mimir>(`${thorApi}/mimir`),
      RxOp.map((response) => MimirIO.decode(response)),
      RxOp.map((result) =>
        // Errors -> Error
        E.mapLeft((_: Errors) => Error(`Failed loading mimir ${PathReporter.report(result)}`))(result)
      ),
      RxOp.map(RD.fromEither),
      RxOp.startWith(RD.pending)
    )
  )
)

export { getNodeInfo$, reloadNodesInfo, mimir$, reloadMimir, getLiquidityProvider, reloadLiquidityProviders }

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { assetToString, baseAmount } from '@xchainjs/xchain-util'
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
import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { envOrDefault } from '../../helpers/envHelper'
import { eqOString } from '../../helpers/fp/eq'
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
  LiquidityProviderLD,
  GetLiquidityProvidersParams,
  GetLiquidityProviderParams
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

const getLiquidityProviders = ({
  assetWithDecimal: { asset, decimal: assetDecimal },
  network
}: GetLiquidityProvidersParams): LiquidityProvidersLD => {
  const poolString = assetToString(asset)
  return FP.pipe(
    reloadLiquidityProviders$,
    RxOp.switchMap(() => thorNodeApiAddress$(network)),
    liveData.chain((api) =>
      FP.pipe(
        api,
        (thorApi) => RxAjax.ajax.getJSON(`${thorApi}/pool/${poolString}/liquidity_providers`),
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
          A.map((provider) => ({
            asset: provider.asset,
            address: provider.rune_address,
            assetAddress: provider.asset_address,
            pendingRune: baseAmount(provider.pending_rune, THORCHAIN_DECIMAL),
            pendingAsset: baseAmount(provider.pending_asset, assetDecimal)
          }))
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

const getLiquidityProvider = ({
  assetWithDecimal,
  network,
  runeAddress,
  assetAddress
}: GetLiquidityProviderParams): LiquidityProviderLD =>
  FP.pipe(
    getLiquidityProviders({
      assetWithDecimal,
      network
    }),
    liveData.map(
      A.findFirst(
        (provider) =>
          eqOString.equals(provider.address, runeAddress) && eqOString.equals(provider.assetAddress, assetAddress)
      )
    )
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
        E.mapLeft((_: t.Errors) => Error(`Failed loading mimir ${PathReporter.report(result)}`))(result)
      ),
      RxOp.map(RD.fromEither),
      RxOp.startWith(RD.pending)
    )
  )
)

export { getNodeInfo$, reloadNodesInfo, mimir$, reloadMimir, getLiquidityProvider, reloadLiquidityProviders }

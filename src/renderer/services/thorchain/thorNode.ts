import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as Rx from 'rxjs'
import * as RxAjax from 'rxjs/ajax'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { envOrDefault } from '../../helpers/envHelper'
import { liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { ErrorId } from '../wallet/types'
import { NodeInfoLD, NodeStatus, ThorNodeApiUrlLD } from './types'

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

const thorNodeApiAddress$ = (network: Network): ThorNodeApiUrlLD => {
  // option to set THORNode api url (for testnet + development only)
  if (!!TESTNET_THORNODE_API && network === 'testnet') {
    return Rx.of(RD.success(TESTNET_THORNODE_API))
  }
  return Rx.of(RD.failure({ errorId: ErrorId.GET_THORNODE_API, msg: 'Not implemented yet' }))
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

export { getNodeInfo$, reloadNodesInfo }

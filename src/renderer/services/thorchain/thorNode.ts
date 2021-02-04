import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { baseAmount } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { THORCHAIN_DECIMAL } from '../../helpers/assetHelper'
import { envOrDefault } from '../../helpers/envHelper'
import { LiveData, liveData } from '../../helpers/rx/liveData'
import { triggerStream } from '../../helpers/stateHelper'
import { Configuration, InlineResponse2002, NodesApi } from '../../types/generated/thornode'
import { ApiError, ErrorId } from '../wallet/types'
import { NodeInfoLD, NodeStatus, ThorNodeApiUrlLD } from './types'

const getNodeStatusByString = (stringStatus = ''): NodeStatus => {
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

const TESTNET_THORNODE_API = envOrDefault(process.env.REACT_APP_TESTNET_THORNODE_API, '')

const thorNodeApiAddress$ = (network: Network): ThorNodeApiUrlLD => {
  if (!!TESTNET_THORNODE_API && network === 'testnet') {
    return Rx.of(RD.success(TESTNET_THORNODE_API))
  }
  return Rx.of(RD.failure({ errorId: ErrorId.GET_THORNODE_API, msg: 'Not implemented yet' }))
}

const getThorNodeApi$ = (network: Network) =>
  FP.pipe(
    thorNodeApiAddress$(network),
    liveData.map((basePath) => new NodesApi(new Configuration({ basePath })))
  )

const getNodeInfo$ = (node: Address, network: Network): NodeInfoLD =>
  FP.pipe(
    reloadNodesInfo$,
    RxOp.debounceTime(300),
    RxOp.switchMap(() => getThorNodeApi$(network)),
    liveData.chain(
      (api): LiveData<ApiError, InlineResponse2002> =>
        FP.pipe(
          api.thorchainNodeNodeAddressGet({ nodeAddress: node }),
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
    liveData.map((nodeData) => ({
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

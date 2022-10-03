import * as RD from '@devexperts/remote-data-ts'
import { Network } from '@xchainjs/xchain-client'
import { ChainIds, ClientUrl } from '@xchainjs/xchain-thorchain'

import { DEFAULT_THORNODE_API_URLS, DEFAULT_THORNODE_RPC_URLS } from '../../../shared/thorchain/const'
import { InteractState, MimirHalt } from './types'

export const INITIAL_INTERACT_STATE: InteractState = {
  step: 1,
  stepsTotal: 2,
  txRD: RD.initial
}

export const DEFAULT_MIMIR_HALT: MimirHalt = {
  haltThorChain: false,
  haltTrading: false,
  haltBtcChain: false,
  haltBtcTrading: false,
  haltEthChain: false,
  haltEthTrading: false,
  haltBchChain: false,
  haltBchTrading: false,
  haltLtcChain: false,
  haltLtcTrading: false,
  haltBnbChain: false,
  haltBnbTrading: false,
  haltDogeChain: false,
  haltDogeTrading: false,
  haltCosmosChain: false,
  haltCosmosTrading: false,
  pauseLp: false,
  pauseLpBnb: false,
  pauseLpBch: false,
  pauseLpBtc: false,
  pauseLpEth: false,
  pauseLpLtc: false,
  pauseLpDoge: false,
  pauseLpCosmos: false
}

export const RESERVE_MODULE_ADDRESS = 'thor1dheycdevq39qlkxs2a6wuuzyn4aqxhve4qxtxt'

// 'unknown' by default - needed to be requested from THORNode before initializing a `xchain-thorchain` client
export const INITIAL_CHAIN_IDS: ChainIds = {
  [Network.Mainnet]: 'unkown-mainnet-chain-id',
  [Network.Stagenet]: 'unkown-stagenet-chain-id',
  [Network.Testnet]: 'unkown-testnet-chain-id'
}

export const DEFAULT_CLIENT_URL: ClientUrl = {
  [Network.Testnet]: {
    node: DEFAULT_THORNODE_API_URLS.testnet,
    rpc: DEFAULT_THORNODE_RPC_URLS.testnet
  },
  [Network.Stagenet]: {
    node: DEFAULT_THORNODE_API_URLS.stagenet,
    rpc: DEFAULT_THORNODE_RPC_URLS.stagenet
  },
  [Network.Mainnet]: {
    node: DEFAULT_THORNODE_API_URLS.mainnet,
    rpc: DEFAULT_THORNODE_RPC_URLS.mainnet
  }
}

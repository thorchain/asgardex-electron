import * as Client from '@xchainjs/xchain-client'
import { isChain, Chain } from '@xchainjs/xchain-util'

import { Network } from '../../shared/api/types'
import { envOrDefault } from '../../shared/utils/env'
import { SlipTolerance } from '../types/asgardex'

export const DEFAULT_NETWORK: Network =
  import.meta.env.DEV && import.meta.env.REACT_APP_DEFAULT_NETWORK === 'testnet' ? 'testnet' : 'mainnet'
export const DEFAULT_SLIP_TOLERANCE: SlipTolerance = 5
export const DEFAULT_CLIENT_NETWORK: Client.Network = Client.Network.Mainnet
export const AVAILABLE_NETWORKS: Network[] = ['testnet', 'stagenet', 'mainnet']
export const ENABLED_CHAINS: Chain[] = envOrDefault(
  import.meta.env.REACT_APP_CHAINS_ENABLED,
  'THOR,BNB,BTC,LTC,BCH,ETH'
)
  .replace(/\s/g, '')
  .split(',')
  .filter(isChain)

// Pagination: max. number of items
export const MAX_ITEMS_PER_PAGE = 10

export const MIDGARD_MAX_RETRY = 3

/**
 * ABI of ETH router contract
 * https://ropsten.etherscan.io/address/0x9d496De78837f5a2bA64Cb40E62c19FBcB67f55a#code
 */
export const ethRouterABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: true, internalType: 'address', name: 'asset', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'memo', type: 'string' }
    ],
    name: 'Deposit',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'oldVault', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newVault', type: 'address' },
      { indexed: false, internalType: 'address', name: 'asset', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'memo', type: 'string' }
    ],
    name: 'TransferAllowance',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'vault', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'address', name: 'asset', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'memo', type: 'string' }
    ],
    name: 'TransferOut',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'oldVault', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newVault', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'asset', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' }
        ],
        indexed: false,
        internalType: 'struct Router.Coin[]',
        name: 'coins',
        type: 'tuple[]'
      },
      { indexed: false, internalType: 'string', name: 'memo', type: 'string' }
    ],
    name: 'VaultTransfer',
    type: 'event'
  },
  {
    inputs: [],
    name: 'RUNE',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'recipients', type: 'address[]' },
      {
        components: [
          { internalType: 'address', name: 'asset', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' }
        ],
        internalType: 'struct Router.Coin[]',
        name: 'coins',
        type: 'tuple[]'
      },
      { internalType: 'string[]', name: 'memos', type: 'string[]' }
    ],
    name: 'batchTransferOut',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address payable', name: 'vault', type: 'address' },
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'string', name: 'memo', type: 'string' }
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'router', type: 'address' },
      { internalType: 'address payable', name: 'asgard', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'asset', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' }
        ],
        internalType: 'struct Router.Coin[]',
        name: 'coins',
        type: 'tuple[]'
      },
      { internalType: 'string', name: 'memo', type: 'string' }
    ],
    name: 'returnVaultAssets',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'router', type: 'address' },
      { internalType: 'address', name: 'newVault', type: 'address' },
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'string', name: 'memo', type: 'string' }
    ],
    name: 'transferAllowance',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address payable', name: 'to', type: 'address' },
      { internalType: 'address', name: 'asset', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'string', name: 'memo', type: 'string' }
    ],
    name: 'transferOut',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' }
    ],
    name: 'vaultAllowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
]

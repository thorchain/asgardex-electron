import { PoolData } from '@thorchain/asgardex-util'
import {
  assetAmount,
  bn,
  AssetBTC,
  AssetETH,
  Asset,
  assetToString,
  baseAmount,
  AssetRuneNative
} from '@xchainjs/xchain-util'

import { PricePoolCurrencyWeights, PricePoolAssets } from './views/pools/Pools.types'

// BUSD testnet (neded for pricing)
export const AssetBUSDBAF: Asset = { chain: 'BNB', symbol: 'BUSD-BAF', ticker: 'BUSD' }
// BUSD mainnet (neded for pricing)
export const AssetBUSDBD1: Asset = { chain: 'BNB', symbol: 'BUSD-BD1', ticker: 'BUSD' }

export const PRICE_ASSETS: PricePoolAssets = [AssetRuneNative, AssetETH, AssetBTC, AssetBUSDBAF, AssetBUSDBD1]

// Weight of currencies needed for pricing
// The higher the value the higher the weight
export const CURRENCY_WHEIGHTS: PricePoolCurrencyWeights = {
  [assetToString(AssetBUSDBAF)]: 0,
  [assetToString(AssetBUSDBD1)]: 1,
  [assetToString(AssetETH)]: 2,
  [assetToString(AssetBTC)]: 3,
  [assetToString(AssetRuneNative)]: 4
}

// Whitelist of pools for pricing things
export const PRICE_POOLS_WHITELIST: PricePoolAssets = [AssetBTC, AssetETH, AssetBUSDBAF, AssetBUSDBD1]

export const ZERO_BN = bn(0)

export const ONE_BN = bn(1)

export const ZERO_ASSET_AMOUNT = assetAmount(ZERO_BN)

export const ZERO_BASE_AMOUNT = baseAmount(ZERO_BN)

export const ZERO_POOL_DATA: PoolData = { runeBalance: ZERO_BASE_AMOUNT, assetBalance: ZERO_BASE_AMOUNT }

export const AssetUSDTERC20: Asset = {
  chain: 'ETH',
  symbol: 'USDT-0x62e273709da575835c7f6aef4a31140ca5b1d190',
  ticker: 'USDT'
}

export const AssetRuneEthERC20: Asset = {
  chain: 'ETH',
  symbol: 'RUNE-0xd601c6A3a36721320573885A8d8420746dA3d7A0',
  ticker: 'RUNE'
}

export const AssetTKN8ERC20: Asset = {
  chain: 'ETH',
  symbol: 'TKN8-0x242aD49dAcd38aC23caF2ccc118482714206beD4',
  ticker: 'TKN8'
}

export const AssetTKN18ERC20: Asset = {
  chain: 'ETH',
  symbol: 'TKN18-0x8E3f9E9b5B26AAaE9d31364d2a8e8a9dd2BE3B82',
  ticker: 'TKN18'
}

// This hardcode list is for testnet only
export const ERC20Assets = [AssetUSDTERC20, AssetRuneEthERC20, AssetTKN8ERC20, AssetTKN18ERC20]
export const ETHAssets = [AssetETH, ...ERC20Assets]

export const routerABI = [
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

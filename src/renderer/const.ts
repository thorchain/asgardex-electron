import { PoolData } from '@thorchain/asgardex-util'
import {
  assetAmount,
  bn,
  AssetBTC,
  AssetETH,
  Asset,
  assetToString,
  baseAmount,
  AssetRuneNative,
  AssetRuneERC20Testnet,
  ETHChain,
  BNBChain,
  AssetRune67C,
  THORChain,
  BTCChain,
  LTCChain,
  BCHChain,
  Chain,
  PolkadotChain,
  CosmosChain,
  DOGEChain,
  TerraChain
} from '@xchainjs/xchain-util'

import { Network } from '../shared/api/types'
import { PricePoolCurrencyWeights, PricePoolAssets } from './views/pools/Pools.types'

//
// ERC-20 assets
//

// ETH.USDT
export const AssetUSDTERC20: Asset = {
  chain: ETHChain,
  symbol: 'USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7',
  ticker: 'USDT',
  synth: false
}

// ETH.USDT - testnet only
export const AssetUSDTERC20Testnet: Asset = {
  chain: ETHChain,
  symbol: 'USDT-0xa3910454bf2cb59b8b3a401589a3bacc5ca42306',
  ticker: 'USDT',
  synth: false
}

export const AssetXRuneAddress = '0x69fa0fee221ad11012bab0fdb45d444d3d2ce71c'
const AssetXRuneSymbol = 'XRUNE'
export const AssetXRune: Asset = {
  chain: ETHChain,
  symbol: `${AssetXRuneSymbol}-${AssetXRuneAddress}`,
  ticker: AssetXRuneSymbol,
  synth: false
}

export const AssetXRuneTestnet: Asset = {
  chain: ETHChain,
  symbol: 'XRUNE-0x8626db1a4f9f3e1002eeb9a4f3c6d391436ffc23',
  ticker: 'XRUNE',
  synth: false
}

export const AssetTGTERC20: Asset = {
  chain: ETHChain,
  symbol: 'TGT-0x108a850856db3f85d0269a2693d896b394c80325',
  ticker: 'TGT',
  synth: false
}

export const AssetTGTERC20Testnet: Asset = {
  chain: ETHChain,
  symbol: 'TGT-0x73d6e26896981798526b6ead48d0fab76e205974',
  ticker: 'TGT',
  synth: false
}

// ETH.UST - testnet only
export const AssetUSTERC20Testnet: Asset = {
  chain: ETHChain,
  symbol: 'UST-0x6cA13a4ab78dd7D657226b155873A04DB929A3A4',
  ticker: 'UST',
  synth: false
}

// ETH.THOR - testnet only
export const AssetThorERC20Testnet: Asset = {
  chain: ETHChain,
  symbol: 'THOR-0xA0b515c058F127a15Dd3326F490eBF47d215588e',
  ticker: 'THOR',
  synth: false
}

// TKN8 - random test asset w/ 8 decimal (testnet only)
export const AssetTKN8ERC20Testnet: Asset = {
  chain: ETHChain,
  symbol: 'TKN8-0x242aD49dAcd38aC23caF2ccc118482714206beD4',
  ticker: 'TKN8',
  synth: false
}

// TKN18 - random test asset w/ 18 decimal (testnet only)
export const AssetTKN18ERC20Testnet: Asset = {
  chain: ETHChain,
  symbol: 'TKN18-0x8E3f9E9b5B26AAaE9d31364d2a8e8a9dd2BE3B82',
  ticker: 'TKN18',
  synth: false
}

// Wrapped Ether (WETH) - testnet only
export const AssetWETHERC20Testnet: Asset = {
  chain: ETHChain,
  symbol: 'WETH-0xbCA556c912754Bc8E7D4Aad20Ad69a1B1444F42d',
  ticker: 'WETH',
  synth: false
}

// DAI - testnet only
export const AssetDAIERC20Testnet: Asset = {
  chain: ETHChain,
  symbol: 'DAI-0xad6d458402f60fd3bd25163575031acdce07538d',
  ticker: 'DAI',
  synth: false
}

// This hardcode list is for testnet only
export const ERC20AssetsTestnet = [
  AssetUSDTERC20Testnet,
  AssetXRuneTestnet,
  AssetUSTERC20Testnet,
  AssetRuneERC20Testnet,
  AssetThorERC20Testnet,
  AssetTKN8ERC20Testnet,
  AssetTKN18ERC20Testnet,
  AssetWETHERC20Testnet,
  AssetDAIERC20Testnet,
  AssetTGTERC20Testnet
]
export const ETHAssetsTestnet = [AssetETH, ...ERC20AssetsTestnet]

// UNIH (exploit contract)
// https://etherscan.io/address/0x4bf5dc91E2555449293D7824028Eb8Fe5879B689
export const AssetUniHAddress = '0x4bf5dc91E2555449293D7824028Eb8Fe5879B689'
const AssetUniHSymbol = 'UNIH'
export const AssetUniH: Asset = {
  chain: ETHChain,
  symbol: `${AssetUniHSymbol}-${AssetUniHAddress}`,
  ticker: AssetUniHSymbol,
  synth: false
}

// Black listed BNB assets
// For now `RUNE-67C` is blacklisted on `mainnet` only, see https://explorer.binance.org/asset/RUNE-67C
export const BinanceBlackList: Record<Network, Array<Asset>> = {
  mainnet: [AssetRune67C],
  stagenet: [AssetRune67C],
  testnet: []
}

//
// All of following assets are needed for pricing USD
//

// BUSD testnet
export const AssetBUSDBAF: Asset = { chain: BNBChain, symbol: 'BUSD-BAF', ticker: 'BUSD', synth: false }
export const AssetBUSD74E: Asset = { chain: BNBChain, symbol: 'BUSD-74E', ticker: 'BUSD', synth: false }
// BUSD mainnet
export const AssetBUSDBD1: Asset = { chain: BNBChain, symbol: 'BUSD-BD1', ticker: 'BUSD', synth: false }
// BNB.USDT
export const AssetUSDTDC8: Asset = { chain: BNBChain, symbol: 'USDT-DC8', ticker: 'USDT', synth: false }
// ETH.USDT mainnet
export const AssetUSDTDAC: Asset = {
  chain: ETHChain,
  symbol: 'USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7',
  ticker: 'USDT',
  synth: false
}
// ETH.USDT testnet
export const AssetUSDT62E: Asset = {
  chain: ETHChain,
  symbol: 'USDT-0x62e273709Da575835C7f6aEf4A31140Ca5b1D190',
  ticker: 'USDT',
  synth: false
}
// ETH.USDC mainnet
export const AssetUSDC: Asset = {
  chain: ETHChain,
  symbol: 'USDC-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  ticker: 'USDC',
  synth: false
}

export const DEFAULT_PRICE_ASSETS: PricePoolAssets = [AssetRuneNative, AssetETH, AssetBTC]

export const USD_PRICE_ASSETS: PricePoolAssets = [
  AssetBUSDBAF,
  AssetBUSDBD1,
  AssetBUSD74E,
  AssetUSDTDC8,
  AssetUSDTDAC,
  AssetUSDT62E,
  AssetUSDTERC20Testnet,
  AssetUSDC
]

// Weight of chains
// Needed for ordering chain related things (wallets, balances etc.)
// The higher the value the higher the weight
export const CHAIN_WEIGHTS: Record<Chain, number> = {
  [THORChain]: 0,
  [BTCChain]: 1,
  [BCHChain]: 2,
  [LTCChain]: 3,
  [ETHChain]: 4,
  [BNBChain]: 5,
  [CosmosChain]: 6,
  [DOGEChain]: 7,
  [TerraChain]: 8,
  [PolkadotChain]: 9
}

// Weight of currencies needed for pricing
// The higher the value the higher the weight
export const CURRENCY_WEIGHTS: PricePoolCurrencyWeights = {
  [assetToString(AssetBUSDBAF)]: 0,
  [assetToString(AssetBUSDBD1)]: 1,
  [assetToString(AssetBUSD74E)]: 2,
  [assetToString(AssetUSDTDC8)]: 3,
  [assetToString(AssetUSDTDAC)]: 4,
  [assetToString(AssetUSDT62E)]: 5,
  [assetToString(AssetUSDTERC20Testnet)]: 6,
  [assetToString(AssetUSDC)]: 7,
  [assetToString(AssetETH)]: 8,
  [assetToString(AssetBTC)]: 9,
  [assetToString(AssetRuneNative)]: 10
}

// Whitelist of pools for pricing things
export const PRICE_POOLS_WHITELIST: PricePoolAssets = [...DEFAULT_PRICE_ASSETS, ...USD_PRICE_ASSETS]

export const ZERO_BN = bn(0)

export const ONE_BN = bn(1)

export const ZERO_ASSET_AMOUNT = assetAmount(ZERO_BN)

export const ZERO_BASE_AMOUNT = baseAmount(ZERO_BN)

export const ZERO_POOL_DATA: PoolData = { runeBalance: ZERO_BASE_AMOUNT, assetBalance: ZERO_BASE_AMOUNT }

export const ASGARDEX_SWAP_IDENTIFIER = 999

export const RECOVERY_TOOL_URL: Record<Network, string> = {
  testnet: 'https://testnet.thorswap.finance/pending',
  stagenet: 'https://stagenet.thorswap.finance/pending',
  mainnet: 'https://app.thorswap.finance/pending'
}

export const ASYM_DEPOSIT_TOOL_URL: Record<Network, string> = {
  testnet: 'https://testnet.thorswap.finance/',
  stagenet: 'https://stagenet.thorswap.finance/',
  mainnet: 'https://app.thorswap.finance/'
}

// @asgdx-team: Extend list whenever another ledger app will be supported
export const SUPPORTED_LEDGER_APPS: Chain[] = [THORChain, BNBChain, BTCChain]

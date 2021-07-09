import { Asset, BNBChain, ETHChain } from '@xchainjs/xchain-util'

type Assets = 'FTM' | 'TOMO' | 'BOLT' | 'USDT' | 'BUSD'

type AssetsTestnet = Record<Assets, Asset>
type AssetsMainnet = Record<Assets, Asset>

export const ASSETS_TESTNET: AssetsTestnet = {
  FTM: { chain: BNBChain, symbol: 'FTM-585', ticker: 'FTM' },
  TOMO: { chain: BNBChain, symbol: 'TOMOB-1E1', ticker: 'TOMOB' },
  BOLT: { chain: BNBChain, symbol: 'BOLT-E42', ticker: 'BOLT' },
  USDT: { chain: BNBChain, symbol: 'USDT-DC8', ticker: 'USDT' },
  BUSD: { chain: BNBChain, symbol: 'BUSD-BAF', ticker: 'USDT' }
}

export const ASSETS_MAINNET: AssetsMainnet = {
  FTM: { chain: BNBChain, symbol: 'FTM-A64', ticker: 'FTM' },
  TOMO: { chain: BNBChain, symbol: 'TOMOB-4BC', ticker: 'TOMOB' },
  BOLT: { chain: BNBChain, symbol: 'BOLT-4C6', ticker: 'BOLT' },
  USDT: { chain: BNBChain, symbol: 'USDT-6D8', ticker: 'USDT' },
  BUSD: { chain: BNBChain, symbol: 'BUSD-BD1', ticker: 'USDT' }
}

type ERCAssets = 'USDT' | 'RUNE'

export const ERC20_MAINNET: Record<ERCAssets, Asset> = {
  USDT: { chain: ETHChain, symbol: 'USDT-0xdac17f958d2ee523a2206206994597c13d831ec7', ticker: 'USDT' },
  RUNE: { chain: ETHChain, symbol: 'RUNE-0xd601c6a3a36721320573885a8d8420746da3d7a0', ticker: 'RUNE' }
}

export const ERC20_TESTNET: Record<ERCAssets, Asset> = {
  USDT: { chain: ETHChain, symbol: 'USDT-0xdb99328b43b86037f80b43c3dbd203f00f056b75', ticker: 'USDT' },
  RUNE: { chain: ETHChain, symbol: 'RUNE-0x3155ba85d5f96b2d030a4966af206230e46849cb', ticker: 'RUNE' }
}

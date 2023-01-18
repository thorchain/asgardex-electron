import { Asset, Chain } from '@xchainjs/xchain-util'

/**
 * Base "chain" asset of Avalanche chain.
 *
 */
export const AssetAVAX: Asset = { chain: Chain.Avalanche, symbol: 'AVAX', ticker: 'AVAX', synth: false }

/**
 * Base "chain" asset of Binance chain.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetBNB: Asset = { chain: Chain.Binance, symbol: 'BNB', ticker: 'BNB', synth: false }

/**
 * Base "chain" asset on bitcoin main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetBTC: Asset = { chain: Chain.Bitcoin, symbol: 'BTC', ticker: 'BTC', synth: false }

/**
 * Base "chain" asset on bitcoin cash main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetBCH: Asset = { chain: Chain.BitcoinCash, symbol: 'BCH', ticker: 'BCH', synth: false }

/**
 * Base "chain" asset on litecoin main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetLTC: Asset = { chain: Chain.Litecoin, symbol: 'LTC', ticker: 'LTC', synth: false }

/**
 * Dogecoin asset
 * Based on definition in Thorchain
 * @see https://gitlab.com/thorchain/thornode/-/blob/781-add-doge-chain/common/asset.go#L24
 */
export const AssetDOGE: Asset = { chain: Chain.Doge, symbol: 'DOGE', ticker: 'DOGE', synth: false }

/**
 * Base "chain" asset on ethereum main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetETH: Asset = { chain: Chain.Ethereum, symbol: 'ETH', ticker: 'ETH', synth: false }

export const RUNE_TICKER = 'RUNE'
/**
 * Base "chain" asset for RUNE-67C on Binance test net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetRune67C: Asset = { chain: Chain.Binance, symbol: 'RUNE-67C', ticker: RUNE_TICKER, synth: false }

/**
 * Base "chain" asset for RUNE-B1A on Binance main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetRuneB1A: Asset = { chain: Chain.Binance, symbol: 'RUNE-B1A', ticker: RUNE_TICKER, synth: false }

/**
 * Base "chain" asset on thorchain main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetRuneNative: Asset = { chain: Chain.THORChain, symbol: RUNE_TICKER, ticker: RUNE_TICKER, synth: false }

/**
 * Base "chain" asset for RUNE on ethereum main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetRuneERC20: Asset = {
  chain: Chain.Ethereum,
  symbol: `${RUNE_TICKER}-0x3155ba85d5f96b2d030a4966af206230e46849cb`,
  ticker: RUNE_TICKER,
  synth: false
}
/**
 * Base "chain" asset for RUNE on ethereum main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetRuneERC20Testnet: Asset = {
  chain: Chain.Ethereum,
  symbol: `${RUNE_TICKER}-0xd601c6A3a36721320573885A8d8420746dA3d7A0`,
  ticker: RUNE_TICKER,
  synth: false
}

export const AssetAtom: Asset = { chain: Chain.Cosmos, symbol: 'ATOM', ticker: 'ATOM', synth: false }

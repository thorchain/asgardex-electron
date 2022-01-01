/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string | boolean>> {
  // local development
  readonly REACT_APP_CHAINS_ENABLED: string
  readonly REACT_APP_WALLET_PASSWORD: string
  readonly REACT_APP_DEFAULT_NETWORK: string
  readonly PORT: string
  // Midgard
  readonly REACT_APP_MIDGARD_TESTNET_URL: string
  readonly REACT_APP_MIDGARD_MAINNET_URL: string
  // THORnode
  readonly REACT_APP_TESTNET_THORNODE_API: string
  readonly REACT_APP_MAINNET_THORNODE_API: string
  readonly REACT_APP_TESTNET_THORNODE_RPC: string
  readonly REACT_APP_MAINNET_THORNODE_RPC: string
  // BTC
  readonly REACT_APP_BLOCKCHAIR_API_KEY: string
  readonly REACT_APP_SOCHAIN_URL: string
  // BCH
  readonly REACT_APP_HASKOIN_TESTNET_URL: string
  readonly REACT_APP_HASKOIN_MAINNET_URL: string
  readonly REACT_APP_BCH_NODE_TESTNET_URL: string
  readonly REACT_APP_BCH_NODE_MAINNET_URL: string
  readonly REACT_APP_BCH_NODE_USERNAME: string
  readonly REACT_APP_BCH_NODE_PASSWORD: string
  // BNB
  readonly REACT_APP_BINANCE_MAINNET_WS_URI: string
  readonly REACT_APP_BINANCE_TESTNET_WS_URI: string
  // ETH
  readonly REACT_APP_ETHERSCAN_API_KEY: string
  readonly REACT_APP_INFURA_PROJECT_ID: string
  readonly REACT_APP_INFURA_PROJECT_SECRET: string
  readonly REACT_APP_ETHPLORER_API_KEY: string
  readonly REACT_APP_ETHPLORER_API_URL: string
  // LTC
  readonly REACT_APP_LTC_NODE_TESTNET_URL: string
  readonly REACT_APP_LTC_NODE_MAINNET_URL: string
  readonly REACT_APP_LTC_NODE_USERNAME: string
  readonly REACT_APP_LTC_NODE_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

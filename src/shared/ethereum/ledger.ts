import { EthDerivationMode } from './types'

// ETH derivation pathes `Legacy`, `Ledger Live`, `MetaMask`
// Based on
// - Definitions in LedgerLive https://github.com/LedgerHQ/ledger-live/blob/develop/libs/ledger-live-common/src/derivation.ts#L43-L55
// - Definitions in MetaMask https://github.com/MetaMask/metamask-extension/blob/develop/ui/pages/create-account/connect-hardware/index.js#L24-L31
const DERIVATION_MAP: Record<EthDerivationMode, string> = {
  legacy: `m/44'/60'/0'/{account}`,
  ledgerlive: `m/44'/60'/{account}'/0/0`,
  metamask: `m/44'/60'/0'/0/{account}`
}

export const getDerivationPath = (walletIndex: number, mode: EthDerivationMode): string =>
  `${DERIVATION_MAP[mode]}`.replace(/{account}/, `${walletIndex}`)

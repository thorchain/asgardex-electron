import { EthDerivationMode } from './types'

// ETH derivation pathes
// Based on https://github.com/LedgerHQ/ledger-live/blob/0059ab0aa6bbc2d952476e65ef9db0f557321cba/libs/ledger-live-common/src/derivation.ts#L42-L53
const DERIVATION_MAP: Record<EthDerivationMode, string> = { legacy: `m/44'/60'/0'/`, ledgerlive: `m/44'/60'/0'/0/` }

export const getDerivationPath = (walletIndex: number, mode: EthDerivationMode): string =>
  `${DERIVATION_MAP[mode]}${walletIndex}`

import { AssetRuneNative, baseAmount } from '@xchainjs/xchain-util'

import { WalletBalance } from '../../services/wallet/types'

/**
 * Helper to create mock instances of `WalletBalances
 *
 * It returns following `WalletBalances` by default
 * ```ts
 *  {
 *    walletType: 'keystore',
 *    amount: baseAmount(1),
 *    asset: AssetRuneNative,
 *    walletAddress: 'wallet-address'
 *    walletIndex: 0
 * }
 * ```
 * Pass any values you want to override
 */
export const mockWalletBalance = (overrides?: Partial<WalletBalance>): WalletBalance => ({
  walletType: 'keystore',
  amount: baseAmount(1),
  asset: AssetRuneNative,
  walletAddress: 'wallet-address',
  walletIndex: 0,
  ...overrides
})

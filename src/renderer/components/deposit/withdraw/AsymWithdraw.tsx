import React from 'react'

import { Asset, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../../shared/api/types'
import { AsymWithdrawStateHandler, ReloadWithdrawFeesHandler, WithdrawFeesHandler } from '../../../services/chain/types'
import { PoolAddress } from '../../../services/midgard/types'
import { ValidatePasswordHandler } from '../../../services/wallet/types'

export type Props = {
  /** Asset to withdraw */
  asset: Asset
  /** Rune price (base amount) */
  runePrice: BigNumber
  /** Asset price (base amount) */
  assetPrice: BigNumber
  /** Wallet balance of chain asset */
  chainAssetBalance: O.Option<BaseAmount>
  /** Selected price asset */
  selectedPriceAsset: Asset
  /** Callback to reload fees */
  reloadFees: ReloadWithdrawFeesHandler
  /** Share of Asset */
  share: BaseAmount
  /** Flag whether form has to be disabled or not */
  disabled?: boolean
  poolAddresses: O.Option<PoolAddress>
  viewRuneTx: (txHash: string) => void
  validatePassword$: ValidatePasswordHandler
  reloadBalances: FP.Lazy<void>
  withdraw$: AsymWithdrawStateHandler
  fees$: WithdrawFeesHandler
  network: Network
}

/**
 * AsymWithdraw component
 *
 * Note: It currently supports asym deposits for paired asset only (but not for RUNE)
 */
export const AsymWithdraw: React.FC<Props> = () => {
  return <div>ASYM withdraw is coming soon</div>
}

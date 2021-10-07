import { Address } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { Network } from '../../../../shared/api/types'
import { UpgradeRuneParams, UpgradeRuneTxState$ } from '../../../services/chain/types'
import { AddressValidation, OpenExplorerTxUrl } from '../../../services/clients'
import { PoolAddressRD } from '../../../services/midgard/types'
import { NonEmptyWalletBalances, ValidatePasswordHandler, WalletType } from '../../../services/wallet/types'
import { AssetWithDecimal } from '../../../types/asgardex'

export type CommonUpgradeProps = {
  runeAsset: AssetWithDecimal
  walletAddress: Address
  walletType: WalletType
  walletIndex: number
  runeNativeAddress: Address
  targetPoolAddressRD: PoolAddressRD
  addressValidation: AddressValidation
  validatePassword$: ValidatePasswordHandler
  upgrade$: (_: UpgradeRuneParams) => UpgradeRuneTxState$
  balances: O.Option<NonEmptyWalletBalances>
  successActionHandler: OpenExplorerTxUrl
  reloadBalancesHandler: FP.Lazy<void>
  network: Network
  reloadOnError: FP.Lazy<void>
}

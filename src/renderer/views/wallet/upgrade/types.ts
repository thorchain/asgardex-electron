import { Address } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'

import { Network } from '../../../../shared/api/types'
import { HDMode, WalletType } from '../../../../shared/wallet/types'
import { UpgradeRuneParams, UpgradeRuneTxState$ } from '../../../services/chain/types'
import { AddressValidation, GetExplorerTxUrl, OpenExplorerTxUrl } from '../../../services/clients'
import { PoolAddressRD } from '../../../services/midgard/types'
import { NonEmptyWalletBalances, ValidatePasswordHandler } from '../../../services/wallet/types'
import { AssetWithDecimal } from '../../../types/asgardex'

export type CommonUpgradeProps = {
  runeAsset: AssetWithDecimal
  walletAddress: Address
  walletType: WalletType
  walletIndex: number
  hdMode: HDMode
  runeNativeAddress: Address
  runeNativeLedgerAddress: O.Option<Address>
  targetPoolAddressRD: PoolAddressRD
  addressValidation: AddressValidation
  validatePassword$: ValidatePasswordHandler
  upgrade$: (_: UpgradeRuneParams) => UpgradeRuneTxState$
  balances: O.Option<NonEmptyWalletBalances>
  reloadBalancesHandler: FP.Lazy<void>
  getExplorerTxUrl: GetExplorerTxUrl
  openExplorerTxUrl: OpenExplorerTxUrl
  network: Network
}

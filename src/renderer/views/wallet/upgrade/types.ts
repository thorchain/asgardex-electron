import { Address } from '@xchainjs/xchain-client'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'

import { Network } from '../../../../shared/api/types'
import { UpgradeRuneParams, UpgradeRuneTxState$ } from '../../../services/chain/types'
import { AddressValidation, GetExplorerTxUrl, OpenExplorerTxUrl } from '../../../services/clients'
import { PoolAddress } from '../../../services/midgard/types'
import { NonEmptyWalletBalances, SelectedWalletAsset, ValidatePasswordHandler } from '../../../services/wallet/types'

export type CommonUpgradeProps = {
  assetData: SelectedWalletAsset & { decimal: number }
  runeNativeAddress: Address
  runeNativeLedgerAddress: O.Option<Address>
  targetPoolAddress: PoolAddress
  addressValidation: AddressValidation
  validatePassword$: ValidatePasswordHandler
  upgrade$: (_: UpgradeRuneParams) => UpgradeRuneTxState$
  balances: O.Option<NonEmptyWalletBalances>
  reloadBalancesHandler: FP.Lazy<void>
  getExplorerTxUrl: GetExplorerTxUrl
  openExplorerTxUrl: OpenExplorerTxUrl
  network: Network
}

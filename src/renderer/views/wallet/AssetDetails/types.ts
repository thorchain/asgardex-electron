import React from 'react'

import { Address } from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { Network } from '../../../../shared/api/types'
import { GetExplorerTxUrl } from '../../../services/clients'
import { NonEmptyWalletBalances } from '../../../services/wallet/types'

export type CommonAssetDetailsProps = {
  balances: O.Option<NonEmptyWalletBalances>
  asset: Asset
  getExplorerTxUrl?: O.Option<GetExplorerTxUrl>
  reloadBalancesHandler?: FP.Lazy<void>
  walletAddress: O.Option<Address>
  network: Network
  historyExtraContent?: (isLoading: boolean) => React.ReactNode
  getExplorerAddressUrl?: O.Option<GetExplorerTxUrl>
}

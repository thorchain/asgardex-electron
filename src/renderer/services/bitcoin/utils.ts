import { TxsPage, Tx } from '@xchainjs/xchain-client'
import * as O from 'fp-ts/lib/Option'

import { AssetTx, AssetTxsPage } from '../wallet/types'

export const toAssetTx = ({ asset, from, to, date, hash }: Tx): AssetTx => ({
  asset: O.some(asset),
  from,
  to,
  date,
  type: 'transfer',
  hash
})

export const toAssetTxsPage = ({ total, txs }: TxsPage): AssetTxsPage => ({
  total,
  txs: txs.map(toAssetTx)
})

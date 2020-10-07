import { Tx, Txs, VOut, VIn } from '@thorchain/asgardex-bitcoin'
import { AssetBTC, baseAmount } from '@thorchain/asgardex-util'
import * as O from 'fp-ts/lib/Option'

import { AssetTx, AssetTxFrom, AssetTxsPage, AssetTxTo } from '../wallet/types'

// TODO (@Veado) Add tests for all util functions
// https://github.com/thorchain/asgardex-electron/issues/509

export const toAssetTxFrom = ({ txid, prevout }: VIn): AssetTxFrom => ({
  from: txid,
  amount: baseAmount(prevout.value)
})

export const toAssetTxTo = ({ scriptpubkey_address, value }: VOut): AssetTxTo => ({
  to: scriptpubkey_address || '',
  amount: baseAmount(value)
})

export const toAssetTx = ({ status, vout, vin, txid }: Tx): AssetTx => ({
  asset: O.some(AssetBTC),
  from: vin.map(toAssetTxFrom),
  // filter out txs with empty addresses
  to: vout.map(toAssetTxTo).filter(({ to }) => !!to),
  date: new Date(status.block_time * 1000),
  type: 'transfer',
  hash: txid
})

export const toTxsPage = (txs: Txs): AssetTxsPage => ({
  // TODO (@Veado) Add pagination https://github.com/thorchain/asgardex-electron/issues/508
  total: 1,
  txs: txs.map(toAssetTx)
})

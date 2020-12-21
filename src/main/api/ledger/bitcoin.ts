import LedgerAppBTC from '@ledgerhq/hw-app-btc'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { getDerivePath, LedgerTxInfo } from '@xchainjs/xchain-bitcoin'
import * as E from 'fp-ts/Either'

import { LedgerErrorId, Network } from '../../../shared/api/types'
import { getErrorId } from './utils'

export const getAddress = async (transport: TransportNodeHid, network: Network) => {
  try {
    const ledgerApp = new LedgerAppBTC(transport)
    const derive_path = getDerivePath(0)
    const info = await ledgerApp.getWalletPublicKey(network === 'testnet' ? derive_path.testnet : derive_path.mainnet, {
      format: 'bech32'
    })

    return E.right(info.bitcoinAddress)
  } catch (error) {
    return E.left(getErrorId(error.toString()))
  }
}

export const signTx = async (
  transport: TransportNodeHid,
  network: Network,
  ledgerTxInfo: LedgerTxInfo
): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const ledgerApp = new LedgerAppBTC(transport)
    const derive_path = getDerivePath(0)
    const txs = ledgerTxInfo.utxos.map((utxo) => {
      return {
        tx: ledgerApp.splitTransaction(utxo.txHex, true),
        ...utxo
      }
    })
    const newTx = ledgerApp.splitTransaction(ledgerTxInfo.newTxHex, true)
    const outputScriptHex = ledgerApp.serializeTransactionOutputs(newTx).toString('hex')
    const txHex = await ledgerApp.createPaymentTransactionNew({
      inputs: txs.map((utxo) => {
        return [utxo.tx, utxo.index, null, null]
      }),
      associatedKeysets: txs.map((_) => (network === 'testnet' ? derive_path.testnet : derive_path.mainnet)),
      outputScriptHex,
      segwit: true,
      additionals: ['bitcoin', 'bech32']
    })

    return E.right(txHex)
  } catch (error) {
    return E.left(getErrorId(error.toString()))
  }
}

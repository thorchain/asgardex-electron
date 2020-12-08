import { ledger, crypto } from '@binance-chain/javascript-sdk'
import LedgerApp from '@binance-chain/javascript-sdk/lib/ledger/ledger-app'
import AppBtc from '@ledgerhq/hw-app-btc'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { LedgerTxInfo } from '@xchainjs/xchain-bitcoin/lib/utils'
import { Chain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerErrorId } from '../../shared/api/types'
import { Network } from '../../shared/api/types'
import { LEDGER } from '../../shared/const'

const getErrorId = (message: string, statusText: string): LedgerErrorId => {
  if (message === 'NoDevice') {
    return LedgerErrorId.NO_DEVICE
  }
  if (message.includes('cannot open device')) {
    return LedgerErrorId.ALREADY_IN_USE
  }
  switch (statusText) {
    case 'SECURITY_STATUS_NOT_SATISFIED':
      return LedgerErrorId.NO_APP
    case 'CLA_NOT_SUPPORTED':
      return LedgerErrorId.WRONG_APP
    case 'INS_NOT_SUPPORTED':
      return LedgerErrorId.WRONG_APP
    case 'CONDITIONS_OF_USE_NOT_SATISFIED':
      return LedgerErrorId.DENIED
    default:
      return LedgerErrorId.UNKNOWN
  }
}

const getBTCAddress = async (network: Network) => {
  try {
    const transport = await TransportNodeHid.open('')
    const appBtc = new AppBtc(transport)
    const info = await appBtc.getWalletPublicKey(
      network === 'testnet' ? LEDGER.BTC_DERIVE_PATH.TESTNET : LEDGER.BTC_DERIVE_PATH.MAINNET,
      { format: 'bech32' }
    )
    await transport.close()

    return E.right(info.bitcoinAddress)
  } catch (error) {
    return E.left(getErrorId(error.message, error.statusText))
  }
}

const getBNBAddress = async (network: Network) => {
  try {
    const timeout = 50000
    const transport = await ledger.transports.node.create(timeout)
    const app: LedgerApp = new ledger.app(transport, 100000, 100000)
    const hdPath = [44, 714, 0, 0, 0]
    // get public key
    const { pk } = await app.getPublicKey(hdPath)
    await transport.close()
    if (pk) {
      // get address from pubkey
      const address = crypto.getAddressFromPublicKey(pk.toString('hex'), network === 'testnet' ? 'tbnb' : 'bnb')
      return E.right(address)
    } else {
      return E.left(LedgerErrorId.UNKNOWN)
    }
  } catch (error) {
    return E.left(getErrorId(error.message, error.statusText))
  }
}

export const getLedgerAddress = (chain: Chain, network: Network) => {
  switch (chain) {
    case 'BNB':
      return getBNBAddress(network)
    case 'BTC':
      return getBTCAddress(network)
    default:
      break
  }
}

const signBtcTxInLedger = async (network: Network, ledgerTx: LedgerTxInfo) => {
  try {
    const transport = await TransportNodeHid.open('')
    const appBtc = new AppBtc(transport)
    const txs = ledgerTx.utxos.map((utxo) => {
      return {
        tx: appBtc.splitTransaction(utxo.txHex, true),
        ...utxo
      }
    })
    const newTx = appBtc.splitTransaction(ledgerTx.newTxHex, true)
    const outputScriptHex = appBtc.serializeTransactionOutputs(newTx).toString('hex')
    const txHex = await appBtc.createPaymentTransactionNew({
      inputs: txs.map((utxo) => {
        return [utxo.tx, utxo.index, null, null]
      }),
      associatedKeysets: txs.map((_) =>
        network === 'testnet' ? LEDGER.BTC_DERIVE_PATH.TESTNET : LEDGER.BTC_DERIVE_PATH.MAINNET
      ),
      outputScriptHex,
      segwit: true,
      additionals: ['bitcoin', 'bech32']
    })
    await transport.close()

    return E.right(txHex)
  } catch (error) {
    return E.left(getErrorId(error.message, error.statusText))
  }
}

export const signTxInLedger = (chain: Chain, network: Network, ledgerTx: LedgerTxInfo) => {
  switch (chain) {
    case 'BNB':
      break
    case 'BTC':
      return signBtcTxInLedger(network, ledgerTx)
    default:
      break
  }
}

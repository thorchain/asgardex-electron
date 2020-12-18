import { crypto } from '@binance-chain/javascript-sdk'
import LedgerAppBNB from '@binance-chain/javascript-sdk/lib/ledger/ledger-app'
import LedgerAppBTC from '@ledgerhq/hw-app-btc'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { getDerivePath as getBNBDerivePath, LedgerTxInfo as LedgerBNCTxInfo } from '@xchainjs/xchain-binance'
import { getDerivePath as getBTCDerivePath, LedgerTxInfo as LedgerBTCTxInfo } from '@xchainjs/xchain-bitcoin'
import { Chain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerErrorId, LedgerTxInfo } from '../../shared/api/types'
import { Network } from '../../shared/api/types'

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

const getBTCAddress = async (transport: TransportNodeHid, network: Network) => {
  try {
    const ledgerApp = new LedgerAppBTC(transport)
    const derive_path = getBTCDerivePath(0)
    const info = await ledgerApp.getWalletPublicKey(network === 'testnet' ? derive_path.testnet : derive_path.mainnet, {
      format: 'bech32'
    })

    return E.right(info.bitcoinAddress)
  } catch (error) {
    return E.left(getErrorId(error.message, error.statusText))
  }
}

const getBNBAddress = async (transport: TransportNodeHid, network: Network) => {
  try {
    const ledgerApp = new LedgerAppBNB(transport)
    const derive_path = getBNBDerivePath(0)
    const { pk } = await ledgerApp.getPublicKey(derive_path)
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

export const getLedgerAddress = async (chain: Chain, network: Network) => {
  try {
    const transport = await TransportNodeHid.open('')
    let res
    switch (chain) {
      case 'BNB':
        res = await getBNBAddress(transport, network)
        break
      case 'BTC':
        res = await getBTCAddress(transport, network)
        break
      default:
        res = E.left(LedgerErrorId.NO_APP)
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left(getErrorId(error.message, error.statusText))
  }
}

const signBTCTxInLedger = async (
  transport: TransportNodeHid,
  network: Network,
  ledgerTxInfo: LedgerBTCTxInfo
): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const ledgerApp = new LedgerAppBTC(transport)
    const derive_path = getBTCDerivePath(0)
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
    return E.left(getErrorId(error.message, error.statusText))
  }
}

const signBNCTxInLedger = async (
  transport: TransportNodeHid,
  network: Network,
  ledgerTxInfo: LedgerBNCTxInfo
): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const { tx, signMsg } = ledgerTxInfo
    const ledgerApp = new LedgerAppBNB(transport)
    const derive_path = getBNBDerivePath(0)
    await ledgerApp.showAddress(network === 'testnet' ? 'tbnb' : 'bnb', derive_path)
    const { pk } = await ledgerApp.getPublicKey(derive_path)
    const signRes = await ledgerApp.sign(tx.getSignBytes(signMsg), derive_path)
    if (signRes && signRes.signature && pk) {
      const pubkey = crypto.getPublicKey(pk.toString('hex'))
      tx.addSignature(pubkey, signRes.signature)
    }

    return E.right(tx.serialize())
  } catch (error) {
    return E.left(getErrorId(error.message, error.statusText))
  }
}

export const signTxInLedger = async (
  chain: Chain,
  network: Network,
  ledgerTxInfo: LedgerTxInfo
): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const transport = await TransportNodeHid.open('')
    let res
    switch (chain) {
      case 'BTC':
        res = await signBTCTxInLedger(transport, network, ledgerTxInfo as LedgerBTCTxInfo)
        break
      case 'BNB':
        res = await signBNCTxInLedger(transport, network, ledgerTxInfo as LedgerBNCTxInfo)
        break
      default:
        res = E.left(LedgerErrorId.NO_APP)
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left(getErrorId(error.message, error.statusText))
  }
}

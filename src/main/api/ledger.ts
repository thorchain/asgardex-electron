import { crypto } from '@binance-chain/javascript-sdk'
import LedgerAppBNB from '@binance-chain/javascript-sdk/lib/ledger/ledger-app'
import LedgerAppBTC from '@ledgerhq/hw-app-btc'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { Client as XChainBinanceClient, getDerivePath as getBNBDerivePath } from '@xchainjs/xchain-binance'
import { getDerivePath as getBTCDerivePath, LedgerTxInfo as LedgerBTCTxInfo } from '@xchainjs/xchain-bitcoin'
import { TxHash } from '@xchainjs/xchain-client'
import { AssetBNB, baseToAsset, Chain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerBNCTxInfo, LedgerErrorId, LedgerTxInfo } from '../../shared/api/types'
import { Network } from '../../shared/api/types'

const getErrorId = (message: string): LedgerErrorId => {
  if (message.includes('NoDevice') || message.includes('0x6804')) {
    return LedgerErrorId.NO_DEVICE
  }
  if (message.includes('cannot open device')) {
    return LedgerErrorId.ALREADY_IN_USE
  }
  if (message.includes('Security not satisfied')) {
    return LedgerErrorId.NO_APP
  }
  if (message.includes('CLA_NOT_SUPPORTED') || message.includes('INS_NOT_SUPPORTED')) {
    return LedgerErrorId.WRONG_APP
  }
  if (message.includes('CONDITIONS_OF_USE_NOT_SATISFIED') || message.includes('no signers')) {
    return LedgerErrorId.DENIED
  }

  return LedgerErrorId.UNKNOWN
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
    return E.left(getErrorId(error.toString()))
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
    return E.left(getErrorId(error.toString()))
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
    return E.left(getErrorId(error.toString()))
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
    return E.left(getErrorId(error.toString()))
  }
}

const sendBNCTxInLedger = async (
  transport: TransportNodeHid,
  network: Network,
  ledgerTxInfo: LedgerBNCTxInfo
): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const { sender, recipient, asset, amount, memo } = ledgerTxInfo
    const client = new XChainBinanceClient({ network: network === 'testnet' ? 'testnet' : 'mainnet' })
    const ledgerApp = new LedgerAppBNB(transport)
    const derive_path = getBNBDerivePath(0)
    const hpr = network === 'testnet' ? 'tbnb' : 'bnb' // This will be replaced later with "const hpr = client.getPrefix()"
    await ledgerApp.showAddress(hpr, derive_path)

    const bncClient = client.getBncClient()
    bncClient.initChain()

    bncClient.useLedgerSigningDelegate(
      ledgerApp,
      () => {},
      () => {},
      () => {},
      derive_path
    )

    const transferResult = await bncClient.transfer(
      sender,
      recipient,
      baseToAsset(amount).amount().toString(),
      asset ? asset.symbol : AssetBNB.symbol,
      memo
    )

    return E.right(transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0])
  } catch (error) {
    return E.left(getErrorId(error.toString()))
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
      default:
        res = E.left(LedgerErrorId.NO_APP)
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left(getErrorId(error.toString()))
  }
}

export const sendTxInLedger = async (
  chain: Chain,
  network: Network,
  ledgerTxInfo: LedgerTxInfo
): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const transport = await TransportNodeHid.open('')
    let res
    switch (chain) {
      case 'BNB':
        res = await sendBNCTxInLedger(transport, network, ledgerTxInfo as LedgerBNCTxInfo)
        break
      default:
        res = E.left(LedgerErrorId.NO_APP)
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left(getErrorId(error.toString()))
  }
}

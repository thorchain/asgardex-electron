import { crypto } from '@binance-chain/javascript-sdk'
import LedgerAppBNB from '@binance-chain/javascript-sdk/lib/ledger/ledger-app'
import LedgerAppBTC from '@ledgerhq/hw-app-btc'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { getDerivePath as getBNBDerivePath } from '@xchainjs/xchain-binance'
import { getDerivePath as getBTCDerivePath, LedgerTxInfo as LedgerBTCTxInfo } from '@xchainjs/xchain-bitcoin'
import { TxHash } from '@xchainjs/xchain-client'
import { AssetBNB, baseToAsset, Chain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerBNBTxInfo, LedgerErrorId, LedgerTxInfo } from '../../shared/api/types'
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

const getBTCAddress = async (network: Network) => {
  try {
    const transport = await TransportNodeHid.open('')
    const ledgerApp = new LedgerAppBTC(transport)
    const derive_path = getBTCDerivePath(0)
    const info = await ledgerApp.getWalletPublicKey(network === 'testnet' ? derive_path.testnet : derive_path.mainnet, {
      format: 'bech32'
    })
    await transport.close()

    return E.right(info.bitcoinAddress)
  } catch (error) {
    return E.left(getErrorId(error.message, error.statusText))
  }
}

const getBNBAddress = async (network: Network) => {
  try {
    const transport = await TransportNodeHid.open('')
    const ledgerApp = new LedgerAppBNB(transport)
    const derive_path = getBNBDerivePath(0)
    const { pk } = await ledgerApp.getPublicKey(derive_path)
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

const signBTCTxInLedger = async (
  network: Network,
  ledgerTxInfo: LedgerBTCTxInfo
): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const transport = await TransportNodeHid.open('')
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
    await transport.close()

    return E.right(txHex)
  } catch (error) {
    return E.left(getErrorId(error.message, error.statusText))
  }
}

const signBNBTxInLedger = async (ledgerTxInfo: LedgerBNBTxInfo): Promise<E.Either<LedgerErrorId, string>> => {
  const {
    client,
    sender,
    asset,
    amount,
    recipient,
    memo,
    handleLedgerPresign,
    handleLedgerVerifySuccess,
    handleLedgerVerifyFailed
  } = ledgerTxInfo
  // await client.initChain()
  const transport = await TransportNodeHid.open('')
  const ledgerApp = new LedgerAppBNB(transport)
  const derive_path = getBNBDerivePath(0)
  client.useLedgerSigningDelegate(
    ledgerApp,
    () => {
      if (handleLedgerPresign) handleLedgerPresign()
    },
    () => {
      if (handleLedgerVerifySuccess) handleLedgerVerifySuccess()
    },
    (error) => {
      if (handleLedgerVerifyFailed) handleLedgerVerifyFailed(getErrorId(error.message, error.statusText))
    },
    derive_path
  )
  const transferResult = await client.transfer(
    sender,
    recipient,
    baseToAsset(amount).amount().toString(),
    asset ? asset.symbol : AssetBNB.symbol,
    memo
  )
  return E.right(transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0])
}

export const signTxInLedger = (
  chain: Chain,
  network: Network,
  ledgerTxInfo: LedgerTxInfo
): Promise<E.Either<LedgerErrorId, string>> => {
  switch (chain) {
    case 'BTC':
      return signBTCTxInLedger(network, ledgerTxInfo as LedgerBTCTxInfo)
    case 'BNB':
      return signBNBTxInLedger(ledgerTxInfo as LedgerBNBTxInfo)
    default:
      return Promise.reject(E.left(LedgerErrorId.NO_APP))
  }
}

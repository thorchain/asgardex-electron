import AppBTC from '@ledgerhq/hw-app-btc'
import { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import Transport from '@ledgerhq/hw-transport'
import { broadcastTx, buildTx, UTXO } from '@xchainjs/xchain-bitcoin'
import { Address, FeeRate, TxHash } from '@xchainjs/xchain-client'
import { BaseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'
import * as E from 'fp-ts/lib/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { getHaskoinApiUrl, getSochainUrl, getBlockstreamUrl } from '../../../../shared/bitcoin/client'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { getDerivationPath } from './common'

type GetRawTxParams = {
  haskoinUrl: string
  txHash: TxHash
}

export const getRawTx = async ({ haskoinUrl, txHash }: GetRawTxParams): Promise<string> => {
  const {
    data: { result }
  } = await axios.get<{
    result: string
  }>(`${haskoinUrl}/transaction/${txHash}/raw`)
  return result
}

const rawTxMap: Map<TxHash, string> = new Map()

const getRawTxFromCache = async ({ txHash, haskoinUrl }: GetRawTxParams): Promise<string> => {
  if (rawTxMap.has(txHash)) {
    return rawTxMap.get(txHash) || 'unknown'
  } else {
    const rawTx = await getRawTx({ txHash, haskoinUrl })
    rawTxMap.set(txHash, rawTx)
    return rawTx
  }
}

/**
 * Sends BTC tx using Ledger
 */
export const send = async ({
  transport,
  network,
  sender,
  recipient,
  amount,
  feeRate,
  memo,
  walletIndex
}: {
  transport: Transport
  network: Network
  sender?: Address
  recipient: Address
  amount: BaseAmount
  feeRate: FeeRate
  memo?: string
  walletIndex: number
}): Promise<E.Either<LedgerError, TxHash>> => {
  if (!sender) {
    return E.left({
      errorId: LedgerErrorId.GET_ADDRESS_FAILED,
      msg: `Getting sender address using Ledger failed`
    })
  }

  try {
    const app = new AppBTC(transport)
    const clientNetwork = toClientNetwork(network)
    const derivePath = getDerivationPath(walletIndex, clientNetwork)

    /**
     * do not spend pending UTXOs when adding a memo
     * https://github.com/xchainjs/xchainjs-lib/issues/330
     *
     * ^ Copied from `Client` (see https://github.com/xchainjs/xchainjs-lib/blob/27929b025151e3cf631862158f3f5f85dab68768/packages/xchain-bitcoin/src/client.ts#L303)
     */
    const spendPendingUTXO = !memo

    console.log('memo:', memo)
    console.log('amount:', amount.amount().toString())
    console.log('feeRate:', feeRate)
    console.log('recipient:', recipient)
    console.log('sender:', sender)
    console.log('network:', clientNetwork)
    console.log('derivePath:', derivePath)
    console.log('sochainUrl:', getSochainUrl())
    console.log('haskoinUrl:', getHaskoinApiUrl()[network])
    console.log('spendPendingUTXO:', spendPendingUTXO)
    console.log('-----')
    console.log('buildTx')
    console.log('-----')

    const haskoinUrl = getHaskoinApiUrl()[network]

    const { psbt, utxos } = await buildTx({
      amount,
      recipient,
      memo,
      feeRate,
      sender,
      network: clientNetwork,
      sochainUrl: getSochainUrl(),
      haskoinUrl,
      spendPendingUTXO
    })

    const newTxUns = psbt.data.globalMap.unsignedTx
    console.log('newTxUns:', newTxUns)
    const newTxHex = psbt.data.globalMap.unsignedTx.toBuffer().toString('hex')
    console.log('newTxHex:', newTxHex)
    const newTx: Transaction = app.splitTransaction(newTxHex, true)

    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    console.log('outputScriptHex:', outputScriptHex)

    console.log('-----')
    console.log('utxos.length', utxos.length)
    console.log('-----')

    // get raw txs
    const rawTxs = await Promise.all(utxos.map(({ hash }) => getRawTxFromCache({ txHash: hash, haskoinUrl })))

    console.log('rawTxs.length', rawTxs.length)
    console.log('-----')
    // Merge UTXO + Transaction
    const txs: Array<UTXO & { tx: Transaction }> = utxos.map((utxo, index) => ({
      tx: app.splitTransaction(rawTxs[index], true),
      ...utxo
    }))

    console.log('txs.length', txs.length)
    console.log('txs[0]', txs[0])
    console.log('txs[1]', txs[1])
    console.log('-----')

    const txHex = await app.createPaymentTransactionNew({
      inputs: txs.map((utxo) => {
        return [utxo.tx, utxo.index, null, null]
      }),
      associatedKeysets: txs.map((_) => derivePath),
      outputScriptHex,
      segwit: true,
      additionals: ['bech32']
    })

    console.log('txHex:', txHex)
    console.log('-----')

    const txHash = await broadcastTx({ network: clientNetwork, txHex, blockstreamUrl: getBlockstreamUrl() })

    console.log('txHash:', txHash)

    if (!txHash) {
      return E.left({
        errorId: LedgerErrorId.INVALID_RESPONSE,
        msg: `Post request to send BTC transaction using Ledger failed`
      })
    }
    return E.right(txHash)
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.SEND_TX_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}

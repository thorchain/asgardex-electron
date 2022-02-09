import AppBTC from '@ledgerhq/hw-app-btc'
import { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import Transport from '@ledgerhq/hw-transport'
import { broadcastTx, buildTx } from '@xchainjs/xchain-bitcoin'
import { Address, FeeRate, TxHash } from '@xchainjs/xchain-client'
import { BaseAmount } from '@xchainjs/xchain-util'
import * as Bitcoin from 'bitcoinjs-lib'
import * as E from 'fp-ts/lib/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { getHaskoinApiUrl, getSochainUrl } from '../../../../shared/bitcoin/client'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { getDerivationPath } from './common'

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
      spendPendingUTXO,
      withTxHex: true
    })

    console.log('-----')
    console.log('utxos.length', utxos.length)
    console.log('-----')

    const inputs: Array<[Transaction, number, string | null, number | null]> = utxos.map(({ txHex, hash, index }) => {
      if (!txHex) {
        throw Error(`Missing 'txHex' for UTXO (txHash ${hash})`)
      }
      const utxoTx = Bitcoin.Transaction.fromHex(txHex)
      const splittedTx = app.splitTransaction(txHex, utxoTx.hasWitnesses())
      return [splittedTx, index, null, null]
    })

    const associatedKeysets: string[] = inputs.map((_) => derivePath)

    const newTxHex = psbt.data.globalMap.unsignedTx.toBuffer().toString('hex')
    console.log('newTxHex:', newTxHex)
    const newTx: Transaction = app.splitTransaction(newTxHex, true)

    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    console.log('outputScriptHex:', outputScriptHex)

    const txHex = await app.createPaymentTransactionNew({
      inputs,
      associatedKeysets,
      outputScriptHex,
      segwit: true,
      useTrustedInputForSegwit: true,
      additionals: ['bech32']
    })

    console.log('txHex:', txHex)
    console.log('-----')

    const txHash = await broadcastTx({ txHex, haskoinUrl })

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

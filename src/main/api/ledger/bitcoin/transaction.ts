import AppBTC from '@ledgerhq/hw-app-btc'
import { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import Transport from '@ledgerhq/hw-transport'
import { broadcastTx, buildTx } from '@xchainjs/xchain-bitcoin'
import { Address, FeeRate, TxHash } from '@xchainjs/xchain-client'
import { BaseAmount } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { getHaskoinApiUrl, getSochainUrl, getBlockstreamUrl } from '../../../../shared/bitcoin/client'
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
    // eslint-disable-next-line no-extra-boolean-cast
    const spendPendingUTXO: boolean = !!memo ? false : true

    console.log('memo:', memo)
    console.log('amount:', amount.amount().toString())
    console.log('feeRate:', feeRate)
    console.log('recipient:', recipient)
    console.log('sender:', sender)
    console.log('network:', clientNetwork)
    console.log('sochainUrl:', getSochainUrl())
    console.log('haskoinUrl:', getHaskoinApiUrl()[network])
    console.log('spendPendingUTXO:', spendPendingUTXO)
    console.log('-----')
    console.log('buildTx')
    console.log('-----')
    const { psbt, utxos } = await buildTx({
      amount,
      recipient,
      memo,
      feeRate,
      sender,
      network: clientNetwork,
      sochainUrl: getSochainUrl(),
      haskoinUrl: getHaskoinApiUrl()[network],
      spendPendingUTXO
    })

    const newTxHex = psbt.data.globalMap.unsignedTx.toBuffer().toString('hex')
    console.log('newTxHex:', newTxHex)
    const newTx: Transaction = app.splitTransaction(newTxHex, true)

    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    console.log('outputScriptHex:', outputScriptHex)

    console.log('-----')
    console.log('splitTransaction')
    console.log('utxos.length', utxos.length)
    console.log('-----')
    const txs = utxos.map((utxo) => {
      console.log('utxo.hash:', utxo.hash)
      console.log('utxo.txHex:', utxo.txHex)
      // FIXME(@veado) txHex is undefined - xchain-bitcoin ignores it `scanUTXOs` (used in `buildTx`)
      return {
        tx: app.splitTransaction(utxo.txHex, true),
        ...utxo
      }
    })

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

import AppBTC from '@ledgerhq/hw-app-btc'
import { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import Transport from '@ledgerhq/hw-transport'
import { Address, FeeRate, TxHash } from '@xchainjs/xchain-client'
import { broadcastTx, buildTx } from '@xchainjs/xchain-litecoin'
import { BaseAmount } from '@xchainjs/xchain-util'
import * as Bitcoin from 'bitcoinjs-lib'
import * as E from 'fp-ts/lib/Either'

import { getSochainUrl } from '../../../../shared/api/sochain'
import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { getNodeAuth, getNodeUrl } from '../../../../shared/litecoin/client'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { getDerivationPath } from './common'

/**
 * Sends LTC tx using Ledger
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

    const { psbt, utxos } = await buildTx({
      amount,
      recipient,
      memo,
      feeRate,
      sender,
      network: clientNetwork,
      sochainUrl: getSochainUrl(),
      withTxHex: true
    })

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
    const newTx: Transaction = app.splitTransaction(newTxHex, true)

    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')

    const txHex = await app.createPaymentTransactionNew({
      inputs,
      associatedKeysets,
      outputScriptHex,
      segwit: true,
      useTrustedInputForSegwit: true,
      additionals: ['bech32']
    })

    const nodeUrl = getNodeUrl(network)
    const auth = getNodeAuth()
    const txHash = await broadcastTx({ txHex, nodeUrl, auth })

    if (!txHash) {
      return E.left({
        errorId: LedgerErrorId.INVALID_RESPONSE,
        msg: `Post request to send LTC transaction using Ledger failed`
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

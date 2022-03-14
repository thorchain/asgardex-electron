import AppBTC from '@ledgerhq/hw-app-btc'
import { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import Transport from '@ledgerhq/hw-transport'
import { broadcastTx, buildTx } from '@xchainjs/xchain-bitcoincash'
import { Address, FeeRate, TxHash } from '@xchainjs/xchain-client'
import { BaseAmount } from '@xchainjs/xchain-util'
import * as Bitcoin from 'bitcoinjs-lib'
import * as E from 'fp-ts/lib/Either'

import { getHaskoinBCHApiUrl } from '../../../../shared/api/haskoin'
import { getBCHNodeAuth, getBCHNodeUrl } from '../../../../shared/api/thornode'
import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { getDerivationPath } from './common'

/**
 * Sends BCH tx using Ledger
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
  console.log('sender:', sender)
  console.log('recipient:', recipient)
  if (!sender) {
    return E.left({
      errorId: LedgerErrorId.GET_ADDRESS_FAILED,
      msg: `Getting sender address using Ledger failed`
    })
  }

  // make sure to convert recipient to Legacy address
  // if (isCashAddress(recipient)) {
  //   recipient = toLegacyAddress(recipient)
  // }

  // if (isCashAddress(sender)) {
  //   sender = toLegacyAddress(sender)
  // }

  console.log('sender LEGACY', sender)
  console.log('recipient LEGACY', recipient)

  try {
    const app = new AppBTC(transport)
    const clientNetwork = toClientNetwork(network)
    const derivePath = getDerivationPath(walletIndex, clientNetwork)

    const haskoinUrl = getHaskoinBCHApiUrl()[network]
    const nodeUrl = getBCHNodeUrl()[network]
    const nodeAuth = getBCHNodeAuth()

    const { builder, utxos } = await buildTx({
      amount,
      recipient,
      memo,
      feeRate,
      sender,
      network: clientNetwork,
      haskoinUrl
    })

    const inputs: Array<[Transaction, number, string | null, number | null]> = utxos.map(({ txHex, hash, index }) => {
      console.log('input txHex:', txHex)

      if (!txHex) {
        throw Error(`Missing 'txHex' for UTXO (txHash ${hash})`)
      }
      const utxoTx = Bitcoin.Transaction.fromHex(txHex)
      const splittedTx = app.splitTransaction(txHex, utxoTx.hasWitnesses())
      return [splittedTx, index, null, null]
    })

    console.log('inputs.lenght:', inputs.length)
    const associatedKeysets: string[] = inputs.map((_) => derivePath)

    console.log('associatedKeysets.length:', associatedKeysets.length)

    // const newTxHex = builder.build().toHex()
    const newTxHex = builder.buildIncomplete().toHex()
    console.log('newTxHex:', newTxHex)
    // const newTxHex = psbt.data.globalMap.unsignedTx.toBuffer().toString('hex')

    const newTx: Transaction = app.splitTransaction(newTxHex, true)
    console.log('newTx:', newTx)
    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    console.log('outputScriptHex:', outputScriptHex)
    const txHex = await app.createPaymentTransactionNew({
      inputs,
      associatedKeysets,
      outputScriptHex,
      segwit: true,
      useTrustedInputForSegwit: true,
      // 'abc' for BCH
      // @see https://github.com/LedgerHQ/ledgerjs/tree/v6.7.0/packages/hw-app-btc#createpaymenttransactionnew
      // Under the hood `hw-app-btc` uses `bip143` then
      // @see https://github.com/LedgerHQ/ledgerjs/blob/90360f1b00a11af4e64a7fc9d980a153ee6f092a/packages/hw-app-btc/src/createTransaction.ts#L120-L123
      additionals: ['abc'],
      sigHashType: 0x41 // If not set, Ledger will throw LEDGER DEVICE: INVALID DATA RECEIVED (0X6A80)
    })

    console.log('txHex:', txHex)
    console.log('nodeUrl:', nodeUrl)
    console.log('username:', nodeAuth.username)
    console.log('password:', nodeAuth.password)
    const txHash = await broadcastTx({ txHex, nodeUrl, auth: nodeAuth })

    console.log('txHash:', txHash)
    if (!txHash) {
      return E.left({
        errorId: LedgerErrorId.INVALID_RESPONSE,
        msg: `Post request to send BCH transaction using Ledger failed`
      })
    }
    return E.right(txHash)
  } catch (error) {
    console.log('catch error:', isError(error) ? error?.message ?? error.toString() : `${error}`)

    return E.left({
      errorId: LedgerErrorId.SEND_TX_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}

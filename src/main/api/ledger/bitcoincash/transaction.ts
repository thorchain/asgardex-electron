import AppBTC from '@ledgerhq/hw-app-btc'
import { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import Transport from '@ledgerhq/hw-transport'
import { AssetBCH, BCHChain, buildTx, LOWER_FEE_BOUND, UPPER_FEE_BOUND } from '@xchainjs/xchain-bitcoincash'
import { checkFeeBounds, FeeRate, TxHash } from '@xchainjs/xchain-client'
import { Address, BaseAmount } from '@xchainjs/xchain-util'
import { HaskoinProvider, HaskoinNetwork } from '@xchainjs/xchain-utxo-providers'
import * as Bitcoin from 'bitcoinjs-lib'
import * as E from 'fp-ts/lib/Either'

import { getHaskoinBCHApiUrl } from '../../../../shared/api/haskoin'
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
  if (!sender) {
    return E.left({
      errorId: LedgerErrorId.GET_ADDRESS_FAILED,
      msg: `Getting sender address using Ledger failed`
    })
  }

  try {
    // safety check for fees, similar to Client.transfer
    // @see https://github.com/xchainjs/xchainjs-lib/blob/21e1f65288b994de8b98cb779550e08c15f96314/packages/xchain-bitcoincash/src/client.ts#L248
    checkFeeBounds({ lower: LOWER_FEE_BOUND, upper: UPPER_FEE_BOUND }, feeRate)

    // Value of `currency` -> `GetAddressOptions` -> `currency` -> `id`
    // Example https://github.com/LedgerHQ/ledger-live/blob/37c0771329dd5a40dfe3430101bbfb100330f6bd/libs/ledger-live-common/src/families/bitcoin/hw-getAddress.ts#L17
    // BCH -> `bitcoin_cash` https://github.com/LedgerHQ/ledger-live/blob/37c0771329dd5a40dfe3430101bbfb100330f6bd/libs/ledgerjs/packages/cryptoassets/src/currencies.ts#L319
    const app = new AppBTC({ transport, currency: 'bitcoin_cash' })
    const clientNetwork = toClientNetwork(network)
    const derivePath = getDerivationPath(walletIndex, clientNetwork)

    const haskoinUrl = getHaskoinBCHApiUrl()[network]
    const haskoinProvider = new HaskoinProvider(haskoinUrl, BCHChain, AssetBCH, 8, HaskoinNetwork.BTC)

    const { builder, inputs: txInputs } = await buildTx({
      amount,
      recipient,
      memo,
      feeRate,
      sender,
      network: clientNetwork,
      haskoinUrl
    })

    const inputs: Array<[Transaction, number, string | null, number | null]> = txInputs.map(
      ({ txHex, hash, index }) => {
        if (!txHex) {
          throw Error(`Missing 'txHex' for UTXO (txHash ${hash})`)
        }
        const utxoTx = Bitcoin.Transaction.fromHex(txHex)
        const splittedTx = app.splitTransaction(txHex, utxoTx.hasWitnesses())
        return [splittedTx, index, null, null]
      }
    )

    const associatedKeysets: string[] = inputs.map((_) => derivePath)

    const newTxHex = builder.buildIncomplete().toHex()

    const newTx: Transaction = app.splitTransaction(newTxHex)
    const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
    const txHex = await app.createPaymentTransaction({
      inputs,
      associatedKeysets,
      outputScriptHex,
      // 'abc' for BCH
      // @see https://github.com/LedgerHQ/ledgerjs/tree/v6.7.0/packages/hw-app-btc#createpaymenttransactionnew
      // Under the hood `hw-app-btc` uses `bip143` then
      // @see https://github.com/LedgerHQ/ledgerjs/blob/90360f1b00a11af4e64a7fc9d980a153ee6f092a/packages/hw-app-btc/src/createTransaction.ts#L120-L123
      additionals: ['abc'],
      sigHashType: 0x41 // If not set, Ledger will throw LEDGER DEVICE: INVALID DATA RECEIVED (0X6A80)
    })

    const txHash = await haskoinProvider.broadcastTx(txHex)

    if (!txHash) {
      return E.left({
        errorId: LedgerErrorId.INVALID_RESPONSE,
        msg: `Post request to send BCH transaction using Ledger failed`
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

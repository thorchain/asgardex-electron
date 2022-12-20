import AppBTC from '@ledgerhq/hw-app-btc'
import { Transaction } from '@ledgerhq/hw-app-btc/lib/types'
import Transport from '@ledgerhq/hw-transport'
import { broadcastTx, buildTx, LOWER_FEE_BOUND, UPPER_FEE_BOUND } from '@xchainjs/xchain-bitcoin'
import { checkFeeBounds, FeeRate, TxHash } from '@xchainjs/xchain-client'
import { Address, BaseAmount } from '@xchainjs/xchain-util'
import * as Bitcoin from 'bitcoinjs-lib'
import * as E from 'fp-ts/lib/Either'

import { getHaskoinBTCApiUrl } from '../../../../shared/api/haskoin'
import { getSochainUrl } from '../../../../shared/api/sochain'
import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
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
    // safety check for fees, similar to handling in `Client.transfer`
    // @see https://github.com/xchainjs/xchainjs-lib/blob/21e1f65288b994de8b98cb779550e08c15f96314/packages/xchain-bitcoin/src/client.ts#L296
    checkFeeBounds({ lower: LOWER_FEE_BOUND, upper: UPPER_FEE_BOUND }, feeRate)

    // Value of `currency` -> `GetAddressOptions` -> `currency` -> `id`
    // Example https://github.com/LedgerHQ/ledger-live/blob/37c0771329dd5a40dfe3430101bbfb100330f6bd/libs/ledger-live-common/src/families/bitcoin/hw-getAddress.ts#L17
    // BTC -> `bitcoin` https://github.com/LedgerHQ/ledger-live/blob/37c0771329dd5a40dfe3430101bbfb100330f6bd/libs/ledgerjs/packages/cryptoassets/src/currencies.ts#L287
    const app = new AppBTC({ transport, currency: 'bitcoin' })
    const clientNetwork = toClientNetwork(network)
    const derivePath = getDerivationPath(walletIndex, clientNetwork)

    /**
     * do not spend pending UTXOs when adding a memo
     * https://github.com/xchainjs/xchainjs-lib/issues/330
     *
     * ^ Copied from `Client` (see https://github.com/xchainjs/xchainjs-lib/blob/27929b025151e3cf631862158f3f5f85dab68768/packages/xchain-bitcoin/src/client.ts#L303)
     */
    const spendPendingUTXO = !memo

    const haskoinUrl = getHaskoinBTCApiUrl()[network]

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

    const txHex = await app.createPaymentTransaction({
      inputs,
      associatedKeysets,
      outputScriptHex,
      segwit: true,
      useTrustedInputForSegwit: true,
      additionals: ['bech32']
    })
    const txHash = await broadcastTx({ txHex, haskoinUrl })

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

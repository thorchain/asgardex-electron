import LedgerApp from '@binance-chain/javascript-sdk/lib/ledger/ledger-app'
import Transport from '@ledgerhq/hw-transport'
import { Client, getDerivePath, getPrefix } from '@xchainjs/xchain-binance'
import { Address, TxHash } from '@xchainjs/xchain-client'
import { Asset, AssetBNB, BaseAmount, baseToAsset } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'

/**
 * Sends `MsgSend` message using Ledger
 */
export const send = async ({
  transport,
  network,
  sender,
  recipient,
  amount,
  asset,
  memo
}: {
  transport: Transport
  amount: BaseAmount
  network: Network
  sender?: Address
  recipient: Address
  asset?: Asset
  memo?: string
}): Promise<E.Either<LedgerError, TxHash>> => {
  try {
    const clientNetwork = toClientNetwork(network)
    const prefix = getPrefix(clientNetwork)
    const derivePath = getDerivePath(0)

    const app = new LedgerApp(transport)
    const client = new Client({ network: clientNetwork })

    const response = await app.showAddress(prefix, derivePath)
    console.log(response)
    const bncClient = client.getBncClient()
    await bncClient.initChain()

    bncClient.useLedgerSigningDelegate(
      app,
      () => {},
      () => {},
      () => {},
      derivePath
    )

    if (!sender) {
      return E.left({
        errorId: LedgerErrorId.GET_ADDRESS_FAILED,
        msg: `Getting sender address failed`
      })
    }

    const { result } = await bncClient.transfer(
      sender,
      recipient,
      baseToAsset(amount).amount().toString(),
      asset ? asset.symbol : AssetBNB.symbol,
      memo
    )

    console.log(result)

    const txhash = result[0]['hash']

    if (!txhash) {
      return E.left({
        errorId: LedgerErrorId.INVALID_RESPONSE,
        msg: `Post request to send 'MsgSend' failed`
      })
    }

    return E.right(txhash)
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.SEND_TX_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}

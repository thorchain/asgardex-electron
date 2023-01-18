import LedgerApp from '@binance-chain/javascript-sdk/lib/ledger/ledger-app'
import Transport from '@ledgerhq/hw-transport'
import { Client, getDerivePath, getPrefix } from '@xchainjs/xchain-binance'
import { TxHash } from '@xchainjs/xchain-client'
import { Address, Asset, BaseAmount, baseToAsset } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/lib/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { AssetBNB } from '../../../../shared/utils/asset'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'

/**
 * Sends Binance tx using Ledger
 */
export const send = async ({
  transport,
  network,
  sender,
  recipient,
  amount,
  asset,
  memo,
  walletIndex
}: {
  transport: Transport
  amount: BaseAmount
  network: Network
  sender?: Address
  recipient: Address
  asset?: Asset
  memo?: string
  walletIndex: number
}): Promise<E.Either<LedgerError, TxHash>> => {
  try {
    const clientNetwork = toClientNetwork(network)
    const prefix = getPrefix(clientNetwork)
    const derivePath = getDerivePath(walletIndex)

    const app = new LedgerApp(transport)
    const client = new Client({ network: clientNetwork })

    await app.showAddress(prefix, derivePath)
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
        msg: `Getting sender address using Ledger failed`
      })
    }

    const { result } = await bncClient.transfer(
      sender,
      recipient,
      baseToAsset(amount).amount().toString(),
      asset?.symbol ?? AssetBNB.symbol,
      memo
    )

    if (result.length === 0 || !result[0].hash) {
      return E.left({
        errorId: LedgerErrorId.INVALID_RESPONSE,
        msg: `Binance client failed to send ${asset?.symbol ?? AssetBNB.symbol} transaction using Ledger`
      })
    }
    const txhash = result[0]['hash']

    if (!txhash) {
      return E.left({
        errorId: LedgerErrorId.INVALID_RESPONSE,
        msg: `Post request to send ${asset?.symbol ?? AssetBNB.symbol} transaction by using Ledger failed`
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

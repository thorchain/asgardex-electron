import { crypto } from '@binance-chain/javascript-sdk'
import AppBNB from '@binance-chain/javascript-sdk/lib/ledger/ledger-app'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { Client, getDerivePath } from '@xchainjs/xchain-binance'
import { TxHash } from '@xchainjs/xchain-client'
import { AssetBNB, baseToAsset } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerBNCTxInfo, LedgerErrorId, Network } from '../../../shared/api/types'
import { getErrorId } from './utils'

export const getAddress = async (transport: TransportNodeHid, network: Network) => {
  try {
    const app = new AppBNB(transport)
    const derive_path = getDerivePath(0)
    const { pk } = await app.getPublicKey(derive_path)
    if (pk) {
      // get address from pubkey
      const address = crypto.getAddressFromPublicKey(pk.toString('hex'), network === 'testnet' ? 'tbnb' : 'bnb')
      return E.right(address)
    } else {
      return E.left(LedgerErrorId.UNKNOWN)
    }
  } catch (error) {
    return E.left(getErrorId(error.toString()))
  }
}

export const sendTx = async (
  transport: TransportNodeHid,
  network: Network,
  txInfo: LedgerBNCTxInfo
): Promise<E.Either<LedgerErrorId, string>> => {
  try {
    const { sender, recipient, asset, amount, memo } = txInfo
    const client = new Client({ network: network === 'testnet' ? 'testnet' : 'mainnet' })
    const app = new AppBNB(transport)
    const derive_path = getDerivePath(0)
    const hpr = network === 'testnet' ? 'tbnb' : 'bnb' // This will be replaced later with "const hpr = client.getPrefix()"
    await app.showAddress(hpr, derive_path)

    const bncClient = client.getBncClient()
    bncClient.initChain()

    bncClient.useLedgerSigningDelegate(
      app,
      () => {},
      () => {},
      () => {},
      derive_path
    )

    const transferResult = await bncClient.transfer(
      sender,
      recipient,
      baseToAsset(amount).amount().toString(),
      asset ? asset.symbol : AssetBNB.symbol,
      memo
    )

    return E.right(transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0])
  } catch (error) {
    return E.left(getErrorId(error.toString()))
  }
}

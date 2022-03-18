import { proto, cosmosclient, rest } from '@cosmos-client/core'
import type Transport from '@ledgerhq/hw-transport'
import THORChainApp, { extractSignatureFromTLV, LedgerErrorType } from '@thorchain/ledger-thorchain'
import { Address, TxHash } from '@xchainjs/xchain-client'
import { CosmosSDKClient } from '@xchainjs/xchain-cosmos'
import { buildTransferTx, buildUnsignedTx } from '@xchainjs/xchain-thorchain'
import {
  buildDepositTx,
  DEFAULT_GAS_VALUE,
  getChainId,
  getDenom,
  getPrefix,
  MsgNativeTx,
  msgNativeTxFromJson
} from '@xchainjs/xchain-thorchain'
import { AssetRuneNative, BaseAmount } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { getClientUrl } from '../../../../shared/thorchain/client'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { fromLedgerErrorType, getDerivationPath } from './common'

/**
 * Sends `MsgSend` message using Ledger
 */
export const send = async ({
  transport,
  network,
  amount,
  memo,
  recipient,
  walletIndex
}: {
  transport: Transport
  amount: BaseAmount
  network: Network
  recipient: Address
  memo?: string
  walletIndex: number
}): Promise<E.Either<LedgerError, TxHash>> => {
  try {
    const clientNetwork = toClientNetwork(network)
    const prefix = getPrefix(clientNetwork)

    const app = new THORChainApp(transport)
    const path = getDerivationPath(walletIndex)
    // get address + public key
    const { bech32Address, returnCode, compressedPk } = await app.getAddressAndPubKey(path, prefix)
    if (!bech32Address || !compressedPk || returnCode !== LedgerErrorType.NoErrors) {
      return E.left({
        errorId: fromLedgerErrorType(returnCode),
        msg: `Getting 'bech32Address' or 'compressedPk' from Ledger THORChainApp failed`
      })
    }

    // Node endpoint for cosmos sdk client
    const nodeUrl = getClientUrl()[network].node
    const chainId = await getChainId(nodeUrl)
    // CosmosClient
    const cosmosClient = new CosmosSDKClient({
      server: nodeUrl,
      chainId,
      prefix
    })

    const denom = getDenom(AssetRuneNative)

    const txBody = await buildTransferTx({
      fromAddress: bech32Address,
      toAddress: recipient,
      assetAmount: amount.amount().toString(),
      assetDenom: denom,
      memo: memo,
      nodeUrl: nodeUrl,
      chainId: chainId
    })

    // get signer address
    const signer = cosmosclient.AccAddress.fromString(bech32Address)

    // get account number + sequence from signer account
    const account = await cosmosClient.getAccount(signer)
    const { account_number, sequence, pub_key } = account

    const txBuilder = buildUnsignedTx({
      cosmosSdk: cosmosClient.sdk,
      txBody: txBody,
      gasLimit: DEFAULT_GAS_VALUE,
      sequence: sequence || cosmosclient.Long.ZERO,
      signerPubkey: cosmosclient.codec.packAny(pub_key)
    })

    const signDocBytes = txBuilder.signDocBytes(account_number || 0)

    // Sign tx body
    const { signature } = await app.sign(path, signDocBytes.toString())

    if (!signature) {
      return E.left({
        errorId: LedgerErrorId.SIGN_FAILED,
        msg: `Signing tx failed`
      })
    }

    // normalize signature
    const normalizeSignature: Buffer = extractSignatureFromTLV(signature)
    txBuilder.addSignature(normalizeSignature)

    // Send signed tx
    const res = await rest.tx.broadcastTx(cosmosClient.sdk, {
      tx_bytes: txBuilder.txBytes(),
      mode: rest.tx.BroadcastTxMode.Block
    })

    const txhash = res ? res.data?.tx_response?.txhash : null

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

/**
 * Sends `MsgDeposit` message using Ledger
 */
export const deposit = async ({
  transport,
  network,
  amount,
  memo,
  walletIndex
}: {
  transport: Transport
  amount: BaseAmount
  network: Network
  memo: string
  walletIndex: number
}): Promise<E.Either<LedgerError, TxHash>> => {
  try {
    const clientNetwork = toClientNetwork(network)
    const prefix = getPrefix(clientNetwork)

    const app = new THORChainApp(transport)
    const path = getDerivationPath(walletIndex)
    // get address + public key
    const { bech32Address, returnCode, compressedPk } = await app.getAddressAndPubKey(path, prefix)
    if (!bech32Address || !compressedPk || returnCode !== LedgerErrorType.NoErrors) {
      return E.left({
        errorId: fromLedgerErrorType(returnCode),
        msg: `Getting 'bech32Address' or 'compressedPk' from Ledger THORChainApp failed`
      })
    }

    // Node endpoint for cosmos sdk client
    const nodeUrl = getClientUrl()[network].node
    const chainId = await getChainId(nodeUrl)
    // use cosmos sdk
    const cosmosClient = new CosmosSDKClient({
      server: nodeUrl,
      chainId,
      prefix
    })

    cosmosClient.setPrefix()

    const msgNativeTx: MsgNativeTx = msgNativeTxFromJson({
      coins: [
        {
          asset: AssetRuneNative,
          amount: amount.amount().toString()
        }
      ],
      memo,
      signer: bech32Address
    })

    const unsignedTxBody: proto.cosmos.tx.v1beta1.TxBody = await buildDepositTx({ msgNativeTx, nodeUrl, chainId })

    // get account number + sequence from signer account
    const signer = cosmosclient.AccAddress.fromString(bech32Address)
    const account = await cosmosClient.getAccount(signer)
    const { account_number, sequence, pub_key } = account

    const fee = new proto.cosmos.tx.v1beta1.Fee({
      amount: [],
      gas_limit: cosmosclient.Long.fromString(DEFAULT_GAS_VALUE)
    })

    const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
      signer_infos: [
        {
          public_key: cosmosclient.codec.packAny(pub_key),
          mode_info: {
            single: {
              mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT
            }
          },
          sequence
        }
      ],
      fee
    })

    const txBuilder = new cosmosclient.TxBuilder(cosmosClient.sdk, unsignedTxBody, authInfo)
    const signDocBytes = txBuilder.signDocBytes(account_number || 0)

    // Sign StdTx
    const { signature } = await app.sign(path, signDocBytes.toString())

    if (!signature) {
      return E.left({
        errorId: LedgerErrorId.SIGN_FAILED,
        msg: `Signing StdTx failed`
      })
    }

    // normalize signature
    const normalizeSignature: Buffer = extractSignatureFromTLV(signature)
    txBuilder.addSignature(normalizeSignature)

    // Send signed tx
    const res = await rest.tx.broadcastTx(cosmosClient.sdk, {
      tx_bytes: txBuilder.txBytes(),
      mode: rest.tx.BroadcastTxMode.Block
    })

    const txhash = res ? res.data?.tx_response?.txhash : null

    if (!txhash) {
      return E.left({
        errorId: LedgerErrorId.INVALID_RESPONSE,
        msg: `Post request to send 'MsgDeposit' failed`
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

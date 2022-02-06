import type Transport from '@ledgerhq/hw-transport'
import THORChainApp, { extractSignatureFromTLV, LedgerErrorType } from '@thorchain/ledger-thorchain'
import { Address, TxHash } from '@xchainjs/xchain-client'
import { BaseAccountResponse, CosmosSDKClient } from '@xchainjs/xchain-cosmos'
import {
  buildDepositTx,
  DEFAULT_GAS_VALUE,
  getDenom,
  getPrefix,
  MsgNativeTx,
  msgNativeTxFromJson,
  registerCodecs
} from '@xchainjs/xchain-thorchain'
import { AssetRuneNative, assetToString, BaseAmount } from '@xchainjs/xchain-util'
import { AccAddress, Msg, PubKeySecp256k1 } from 'cosmos-client'
import { auth, BaseAccount, StdTx } from 'cosmos-client/x/auth'
import { MsgSend } from 'cosmos-client/x/bank'
import * as E from 'fp-ts/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { getChainIds, getClientUrl } from '../../../../shared/thorchain/client'
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
    const hostURL = getClientUrl()[network].node
    const chainId = getChainIds()[network]
    // CosmosClient
    const cosmosClient = new CosmosSDKClient({
      server: hostURL,
      chainId,
      prefix
    })

    // get signer address
    const signer = AccAddress.fromBech32(bech32Address)

    registerCodecs(prefix)
    // get account number + sequence from signer account
    let {
      data: { result: account }
    } = await auth.accountsAddressGet(cosmosClient.sdk, signer)
    // Note: Cosmos API has been changed - result has another JSON structure now !!
    // Code is copied from xchain-cosmos -> SDKClient -> signAndBroadcast
    if (account.account_number === undefined) {
      account = BaseAccount.fromJSON((account as BaseAccountResponse).value)
    }
    const { account_number, sequence } = account
    const denom = getDenom(AssetRuneNative)
    // Create unsigned Msg
    const unsignedMsg: Msg = MsgSend.fromJSON({
      from_address: bech32Address,
      to_address: recipient,
      amount: [
        {
          amount: amount.amount().toString(),
          denom
        }
      ]
    })

    // Create unsigned StdTx
    const unsignedStdTx = StdTx.fromJSON({
      msg: [unsignedMsg],
      fee: {
        amount: [],
        gas: DEFAULT_GAS_VALUE
      },
      signatures: [],
      memo: memo || ''
    })

    // Get bytes from StdTx to sign
    const signedStdTx = unsignedStdTx.getSignBytes(chainId, account_number.toString(), sequence.toString())

    // Sign StdTx
    const { signature } = await app.sign(path, signedStdTx.toString())

    if (!signature) {
      return E.left({
        errorId: LedgerErrorId.SIGN_FAILED,
        msg: `Signing StdTx failed`
      })
    }

    // normalize signature
    const normalizeSignature: Buffer = extractSignatureFromTLV(signature)

    // create final StdTx
    const stdTx = new StdTx(
      unsignedStdTx.msg,
      unsignedStdTx.fee,
      [
        {
          pub_key: PubKeySecp256k1.fromBase64(compressedPk.toString('base64')),
          signature: normalizeSignature.toString('base64')
        }
      ],
      unsignedStdTx.memo
    )

    // Send signed StdTx
    const {
      data: { txhash }
    } = await auth.txsPost(cosmosClient.sdk, stdTx, 'sync')

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
    const chainId = getChainIds()[network]
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
          asset: assetToString(AssetRuneNative),
          amount: amount.amount().toString()
        }
      ],
      memo,
      signer: bech32Address
    })

    const unsignedStdTx: StdTx = await buildDepositTx({ msgNativeTx, nodeUrl, chainId })

    // get account number + sequence from signer account
    let {
      data: { result: account }
    } = await auth.accountsAddressGet(cosmosClient.sdk, msgNativeTx.signer)
    // Note: Cosmos API has been changed - result has another JSON structure now !!
    // Code is copied from xchain-cosmos -> SDKClient -> signAndBroadcast
    if (account.account_number === undefined) {
      account = BaseAccount.fromJSON((account as BaseAccountResponse).value)
    }
    const { account_number, sequence } = account
    // Get bytes from StdTx to sign
    const signedStdTx = unsignedStdTx.getSignBytes(chainId, account_number.toString(), sequence.toString())
    // Sign StdTx
    const { signature } = await app.sign(path, signedStdTx.toString())

    if (!signature) {
      return E.left({
        errorId: LedgerErrorId.SIGN_FAILED,
        msg: `Signing StdTx failed`
      })
    }

    // normalize signature
    const normalizeSignature: Buffer = extractSignatureFromTLV(signature)
    // create final StdTx
    const stdTx = new StdTx(
      unsignedStdTx.msg,
      unsignedStdTx.fee,
      [
        {
          pub_key: PubKeySecp256k1.fromBase64(compressedPk.toString('base64')),
          signature: normalizeSignature.toString('base64')
        }
      ],
      unsignedStdTx.memo
    )

    // Send signed StdTx
    const {
      data: { txhash }
    } = await auth.txsPost(cosmosClient.sdk, stdTx, 'sync')

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

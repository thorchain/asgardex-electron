import type Transport from '@ledgerhq/hw-transport'
import THORChainApp, { extractSignatureFromTLV, LedgerErrorType } from '@thorchain/ledger-thorchain'
import { Address, TxHash } from '@xchainjs/xchain-client'
import { BaseAccountResponse } from '@xchainjs/xchain-cosmos'
import { DEFAULT_GAS_LIMIT_VALUE, getChainId, getDenom, getPrefix } from '@xchainjs/xchain-thorchain'
import { AssetRuneNative, assetToString, BaseAmount, delay } from '@xchainjs/xchain-util'
import { AccAddress, PubKeySecp256k1, Msg, CosmosSDK } from 'cosmos-client'
import { StdTx, auth, BaseAccount } from 'cosmos-client/x/auth'
import { MsgSend } from 'cosmos-client/x/bank'
import * as E from 'fp-ts/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { getClientUrl } from '../../../../shared/thorchain/client'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { fromLedgerErrorType, getDerivationPath } from './common'
import * as Legacy from './transaction-legacy'

/**
 * Sends `MsgSend` message using Ledger
 * Note: As long as Ledger THOR app has not been updated, amino encoding/decoding is still used.
 * That's why txs are still broadcasted to `txs` endpoint, which is still supported by THORChain.
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

    const sdk = new CosmosSDK(nodeUrl, chainId)

    const signer = AccAddress.fromBech32(bech32Address)
    const denom = getDenom(AssetRuneNative)

    Legacy.registerCodecs(prefix)
    // get account number + sequence from signer account
    let {
      data: { result: account }
    } = await auth.accountsAddressGet(sdk, signer)
    // Note: Cosmos API has been changed - result has another JSON structure now !!
    // Code is copied from xchain-cosmos -> SDKClient -> signAndBroadcast
    if (account.account_number === undefined) {
      account = BaseAccount.fromJSON((account as BaseAccountResponse).value)
    }

    const { account_number, sequence } = account
    if (!account_number || sequence === undefined) {
      return E.left({
        errorId: fromLedgerErrorType(returnCode),
        msg: `Getting 'account_number' or 'sequence' from 'account' failed (account_number: ${account_number}, sequence:  ${sequence})`
      })
    }

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
    const unsignedStdTx = new StdTx(
      [unsignedMsg],
      {
        amount: [],
        gas: DEFAULT_GAS_LIMIT_VALUE
      },
      [],
      memo || ''
    )

    const signedStdTx = unsignedStdTx.getSignBytes(chainId, account_number.toString(), sequence.toString())

    // Sign StdTx
    const { signature } = await app.sign(path, signedStdTx.toString())

    if (!signature) {
      return E.left({
        errorId: LedgerErrorId.SIGN_FAILED,
        msg: `Signing tx failed`
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
    const { data } = await Legacy.txsPost(nodeUrl, stdTx, sequence)
    // console.log('data:', data)
    const { txhash } = data

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
 * Note: As long as Ledger THOR app has not been updated, amino encoding/decoding is still used.
 * That's why txs are still broadcasted to `txs` endpoint, which is still supported by THORChain.
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

    const sdk = new CosmosSDK(nodeUrl, chainId)

    const signer = AccAddress.fromBech32(bech32Address)

    const msgNativeTx: Legacy.MsgNativeTx = Legacy.msgNativeTxFromJson({
      coins: [
        {
          asset: assetToString(AssetRuneNative),
          amount: amount.amount().toString()
        }
      ],
      memo,
      signer: bech32Address
    })

    Legacy.registerCodecs(prefix)

    const unsignedStdTx: StdTx = await Legacy.buildDepositTx({ msgNativeTx, nodeUrl, chainId })

    await delay(200)

    // get account number + sequence from signer account
    const accountData = await auth.accountsAddressGet(sdk, signer)
    let {
      data: { result: account }
    } = accountData

    // Note: Cosmos API has been changed - result has another JSON structure now !!
    // Code is copied from xchain-cosmos -> SDKClient -> signAndBroadcast
    if (account.account_number === undefined) {
      account = BaseAccount.fromJSON((account as BaseAccountResponse).value)
    }

    const { account_number, sequence } = account
    if (!account_number || sequence === undefined) {
      return E.left({
        errorId: fromLedgerErrorType(returnCode),
        msg: `Getting 'account_number' or 'sequence' from 'account' failed (account_number: ${account_number}, sequence:  ${sequence})`
      })
    }

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

    // Send signed tx
    const { data } = await Legacy.txsPost(nodeUrl, stdTx, sequence)
    // console.log('data:', data)
    const { txhash } = data

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

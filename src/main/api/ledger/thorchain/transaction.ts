// import { proto, cosmosclient, rest } from '@cosmos-client/core'
import type Transport from '@ledgerhq/hw-transport'
import THORChainApp, { extractSignatureFromTLV, LedgerErrorType } from '@thorchain/ledger-thorchain'
import { Address, TxHash } from '@xchainjs/xchain-client'
import { BaseAccountResponse } from '@xchainjs/xchain-cosmos'
import { MsgCoin, DEFAULT_GAS_VALUE, getChainId, getDenom, getPrefix } from '@xchainjs/xchain-thorchain'
import { AssetRuneNative, BaseAmount } from '@xchainjs/xchain-util'
import { AccAddress, PubKeySecp256k1, Msg, codec, CosmosSDK } from 'cosmos-client'
import { TransactionsApi } from 'cosmos-client/api'
import { StdTx, auth, BaseAccount } from 'cosmos-client/x/auth'
import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank'
import * as E from 'fp-ts/Either'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { getClientUrl } from '../../../../shared/thorchain/client'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { fromLedgerErrorType, getDerivationPath } from './common'

// MsgNativeTx (legacy)
// copied from previous (deprecated) xchain-thorchain
// https://github.com/xchainjs/xchainjs-lib/blob/979db1d9207ecbd7875cbd61b1c48b67cc9a6a5c/packages/xchain-thorchain/src/types/messages.ts
export class MsgNativeTx extends Msg {
  coins: MsgCoin[]
  memo: string
  signer: AccAddress

  constructor(coins: MsgCoin[], memo: string, signer: AccAddress) {
    super()

    this.coins = coins
    this.memo = memo
    this.signer = signer
  }
}

// Helper msgNativeTxFromJson (legacy)
// copied from previous (deprecated) xchain-thorchain
// https://github.com/xchainjs/xchainjs-lib/blob/979db1d9207ecbd7875cbd61b1c48b67cc9a6a5c/packages/xchain-thorchain/src/types/messages.ts
const _msgNativeTxFromJsonLegacy = (value: { coins: MsgCoin[]; memo: string; signer: string }): MsgNativeTx => {
  return new MsgNativeTx(value.coins, value.memo, AccAddress.fromBech32(value.signer))
}

// Helper to register codecs
// copied from previous (deprecated) xchain-thorchain
// https://github.com/xchainjs/xchainjs-lib/blob/979db1d9207ecbd7875cbd61b1c48b67cc9a6a5c/packages/xchain-thorchain/src/util.ts#L115-L127
const registerCodecsLegacy = (prefix: string): void => {
  codec.registerCodec('thorchain/MsgSend', MsgSend, MsgSend.fromJSON)
  codec.registerCodec('thorchain/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)

  AccAddress.setBech32Prefix(
    prefix,
    prefix + 'pub',
    prefix + 'valoper',
    prefix + 'valoperpub',
    prefix + 'valcons',
    prefix + 'valconspub'
  )
}

// Similar to `x.auth.txsPost` of (deprecated) xchain-client@0.39.13
// https://github.com/cosmos-client/cosmos-client-ts/blob/v0.39.13/src/x/auth/module.ts#L104-L113
const _txsPostLegacy = (nodeUrl: string, tx: StdTx) => {
  // const url = `${nodeUrl}/cosmos/tx/v1beta1`
  const url = `${nodeUrl}`
  console.log('url:', url)
  const txValue = JSON.parse(codec.toJSONString(tx)).value
  console.log('tx:', tx)
  return new TransactionsApi(undefined, url).txsPost({
    tx: txValue,
    mode: 'sync'
  })
}

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

    // const pubKey = new proto.cosmos.crypto.secp256k1.PubKey({ key: new Uint8Array(compressedPk) })
    // Node endpoint for cosmos sdk client
    const nodeUrl = getClientUrl()[network].node
    const chainId = await getChainId(nodeUrl)

    // CosmosClient
    // const _cosmosClient = new CosmosSDKClient({
    //   server: nodeUrl,
    //   chainId,
    //   prefix
    // })

    const sdk = new CosmosSDK(nodeUrl, chainId)

    const signer = AccAddress.fromBech32(bech32Address)
    const denom = getDenom(AssetRuneNative)

    // const signer: cosmosclient.AccAddress = cosmosclient.AccAddress.fromPublicKey(pubKey)

    registerCodecsLegacy(prefix)
    // get account number + sequence from signer account
    // const account = await cosmosClient.getAccount(signer)

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
    if (!account_number || !sequence) {
      return E.left({
        errorId: fromLedgerErrorType(returnCode),
        msg: `Getting 'account_number' or 'sequence' from 'account' failed (account_number: ${account_number}, sequence:  ${sequence})`
      })
    }

    console.log('account_number.toString():', account_number.toString())
    console.log('sequence.toString():', sequence.toString())
    console.log('chainId:', chainId)

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

    console.log('unsignedMsg:', unsignedMsg.toString())

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

    console.log('unsignedStdTx:', unsignedStdTx)

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

    console.log('stdTx:', stdTx)

    // Send signed tx
    // const {
    //   data: { txhash }
    // } = await txsPostLegacy(nodeUrl, stdTx)

    // Send signed StdTx
    const {
      data: { txhash }
    } = await auth.txsPost(sdk, stdTx, 'sync')

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

export const deposit = async (_: {
  transport: Transport
  amount: BaseAmount
  network: Network
  memo: string
  walletIndex: number
}): Promise<E.Either<LedgerError, TxHash>> => Promise.reject('Ledger "deposit" needs to be fixed for THOR')

/**
 * Sends `MsgDeposit` message using Ledger
 */
// export const deposit = async ({
//   transport,
//   network,
//   amount,
//   memo,
//   walletIndex
// }: {
//   transport: Transport
//   amount: BaseAmount
//   network: Network
//   memo: string
//   walletIndex: number
// }): Promise<E.Either<LedgerError, TxHash>> => {
//   try {
//     const clientNetwork = toClientNetwork(network)
//     const prefix = getPrefix(clientNetwork)

//     const app = new THORChainApp(transport)
//     const path = getDerivationPath(walletIndex)
//     // get address + public key
//     const { bech32Address, returnCode, compressedPk } = await app.getAddressAndPubKey(path, prefix)
//     if (!bech32Address || !compressedPk || returnCode !== LedgerErrorType.NoErrors) {
//       return E.left({
//         errorId: fromLedgerErrorType(returnCode),
//         msg: `Getting 'bech32Address' or 'compressedPk' from Ledger THORChainApp failed`
//       })
//     }

//     // Node endpoint for cosmos sdk client
//     const nodeUrl = getClientUrl()[network].node
//     const chainId = await getChainId(nodeUrl)
//     // use cosmos sdk
//     const cosmosClient = new CosmosSDKClient({
//       server: nodeUrl,
//       chainId,
//       prefix
//     })

//     const msgNativeTx = msgNativeTxFromJson({
//       coins: [
//         {
//           asset: AssetRuneNative,
//           amount: amount.amount().toString()
//         }
//       ],
//       memo,
//       signer: bech32Address
//     })

//     const unsignedTxBody: proto.cosmos.tx.v1beta1.TxBody = await buildDepositTx({ msgNativeTx, nodeUrl, chainId })

//     // get account number + sequence from signer account
//     const signer = cosmosclient.AccAddress.fromString(bech32Address)
//     const account = await cosmosClient.getAccount(signer)
//     const { account_number, sequence, pub_key } = account

//     const fee = new proto.cosmos.tx.v1beta1.Fee({
//       amount: [],
//       gas_limit: cosmosclient.Long.fromString(DEFAULT_GAS_VALUE)
//     })

//     const authInfo = new proto.cosmos.tx.v1beta1.AuthInfo({
//       signer_infos: [
//         {
//           public_key: cosmosclient.codec.packAny(pub_key),
//           mode_info: {
//             single: {
//               mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT
//             }
//           },
//           sequence
//         }
//       ],
//       fee
//     })

//     const txBuilder = new cosmosclient.TxBuilder(cosmosClient.sdk, unsignedTxBody, authInfo)
//     const signDocBytes = txBuilder.signDocBytes(account_number || 0)

//     // Sign StdTx
//     const { signature } = await app.sign(path, signDocBytes.toString())

//     if (!signature) {
//       return E.left({
//         errorId: LedgerErrorId.SIGN_FAILED,
//         msg: `Signing StdTx failed`
//       })
//     }

//     // normalize signature
//     const normalizeSignature: Buffer = extractSignatureFromTLV(signature)
//     txBuilder.addSignature(normalizeSignature)

//     // Send signed tx
//     const res = await rest.tx.broadcastTx(cosmosClient.sdk, {
//       tx_bytes: txBuilder.txBytes(),
//       mode: rest.tx.BroadcastTxMode.Block
//     })

//     const txHash = res ? res.data?.tx_response?.txhash : null

//     if (!txHash) {
//       return E.left({
//         errorId: LedgerErrorId.INVALID_RESPONSE,
//         msg: `Post request to send 'MsgDeposit' failed`
//       })
//     }

//     return E.right(txHash)
//   } catch (error) {
//     return E.left({
//       errorId: LedgerErrorId.SEND_TX_FAILED,
//       msg: isError(error) ? error?.message ?? error.toString() : `${error}`
//     })
//   }
// }

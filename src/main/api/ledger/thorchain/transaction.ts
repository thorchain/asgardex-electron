import type Transport from '@ledgerhq/hw-transport'
import THORChainApp, { extractSignatureFromTLV, LedgerErrorType } from '@thorchain/ledger-thorchain'
import { Address, TxHash } from '@xchainjs/xchain-client'
import { BaseAccountResponse, CosmosSDKClient } from '@xchainjs/xchain-cosmos'
import { DEFAULT_GAS_VALUE, getChainId, getDenom, getPrefix, registerCodecs } from '@xchainjs/xchain-thorchain'
import { AssetRuneNative, BaseAmount } from '@xchainjs/xchain-util'
import { AccAddress, Msg, PubKeySecp256k1 } from 'cosmos-client'
import { auth, BaseAccount, StdTx } from 'cosmos-client/x/auth'
import { MsgSend } from 'cosmos-client/x/bank'
import * as E from 'fp-ts/Either'

import { LedgerErrorId, Network } from '../../../../shared/api/types'
import { getClientUrl } from '../../../../shared/thorchain/client'
import { toClientNetwork } from '../../../../shared/utils/client'
import { getErrorId } from '../utils'
import { fromLedgerErrorType, PATH } from './common'

export const sendTx = async ({
  transport,
  network,
  amount,
  memo,
  recipient
}: {
  transport: Transport
  amount: BaseAmount
  network: Network
  recipient: Address
  memo?: string
}): Promise<E.Either<LedgerErrorId, TxHash>> => {
  try {
    const clientNetwork = toClientNetwork(network)
    const prefix = getPrefix(clientNetwork)

    const app = new THORChainApp(transport)
    // get address + public key
    const { bech32Address, returnCode, compressedPk } = await app.getAddressAndPubKey(PATH, prefix)
    if (!bech32Address || !compressedPk || returnCode !== LedgerErrorType.NoErrors) {
      return E.left(fromLedgerErrorType(returnCode))
    }

    // Node endpoint for cosmos sdk client
    const hostURL = getClientUrl()[network].node
    const chainId = getChainId()
    // use cosmos sdk
    const sdk = new CosmosSDKClient({
      server: hostURL,
      chainId,
      prefix
    }).sdk

    // get signer address
    const signer = AccAddress.fromBech32(bech32Address)

    registerCodecs(prefix)
    // get account number + sequence from signer account
    let {
      data: { result: account }
    } = await auth.accountsAddressGet(sdk, signer)
    // Note: Cosmos API has been changed - result has another JSON structure now !!
    // Code is copied from xchain-cosmos -> SDKClient -> signAndBroadcast)
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
    const { signature } = await app.sign(PATH, signedStdTx.toString())

    if (!signature) {
      return E.left(LedgerErrorId.SIGN_FAILED)
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
    } = await auth.txsPost(sdk, stdTx, 'block')

    if (!txhash) {
      return E.left(LedgerErrorId.SEND_TX_FAILED)
    }

    return E.right(txhash)
  } catch (error) {
    return E.left(getErrorId(error))
  }
}

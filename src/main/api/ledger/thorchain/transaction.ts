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
import { getErrorId } from '../utils'
import { fromLedgerErrorType, PATH, toClientNetwork } from './common'

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
    console.log('ledger/thor/sendTx:', network)
    const { bech32Address, returnCode, compressedPk } = await app.getAddressAndPubKey(PATH, prefix)
    console.log('sendTx bech32Address:', bech32Address)
    console.log('sendTx returnCode:', returnCode)
    console.log('sendTx compressedPk:', compressedPk)
    console.log('sendTx amount', amount.amount().toString())
    if (!bech32Address || !compressedPk || returnCode !== LedgerErrorType.NoErrors) {
      return E.left(fromLedgerErrorType(returnCode))
    }

    // Node endpoint for cosmos sdk client
    const hostURL = getClientUrl()[network].node
    console.log('nodeUrl:', hostURL)
    const chainId = getChainId()
    console.log('chainId:', chainId)
    console.log('prefix:', prefix)
    // use cosmos sdk
    const client = new CosmosSDKClient({
      server: hostURL,
      chainId,
      prefix
    })
    const sdk = client.sdk
    console.log('sdk:', sdk)

    // get signer address
    const signer = AccAddress.fromBech32(bech32Address)

    console.log('signer:', signer)
    console.log('auth.accountsAddressGet:', auth.accountsAddressGet)

    // get account number + sequence from signer account
    // const {
    //   data: { result }
    // } = await auth.accountsAddressGet(sdk, signer)

    // Cosmos API has been changed - result has another JSON structure now
    // Code is copied from xchain-cosmos -> SDKClient -> signAndBroadcast)
    registerCodecs(prefix)
    let account: BaseAccount = (await auth.accountsAddressGet(sdk, signer)).data.result
    console.log('account:', account)
    if (account.account_number === undefined) {
      account = BaseAccount.fromJSON((account as BaseAccountResponse).value)
    }

    const { account_number, sequence } = account
    console.log('account_number:', account.account_number)
    console.log('sequence:', sequence)

    // Create unsigned Msg
    const unsignedMsg: Msg = [
      MsgSend.fromJSON({
        from_address: bech32Address,
        to_address: recipient,
        amount: [
          {
            amount: amount.amount().toString(),
            denom: getDenom(AssetRuneNative)
          }
        ]
      })
    ]

    console.log('unsignedMsg:', unsignedMsg)

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

    // Get bytes from StdTx to sign
    const signedStdTx = unsignedStdTx.getSignBytes(chainId, account_number.toString(), sequence.toString())

    console.log('signedStdTx:', signedStdTx)

    // Sign StdTx
    const { signature } = await app.sign(PATH, signedStdTx.toString())
    console.log('signature:', signature)

    if (!signature) {
      return E.left(LedgerErrorId.SIGN_FAILED)
    }

    // normalize signature
    const normalizeSignature: Buffer = extractSignatureFromTLV(signature)

    console.log('normalizeSignature:', normalizeSignature)

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

    // Send signed StdTx
    // const {
    //   data: { txhash }
    // } = await auth.txsPost(sdk, stdTx, 'block')

    // if (!txhash) {
    //   return E.left(LedgerErrorId.SEND_TX_FAILED)
    // }
    // Send signed StdTx
    const response = await auth.txsPost(sdk, stdTx, 'block')

    console.log('response:', response)
    console.log('data:', response.data)

    if (!response.data.txhash) {
      return E.left(LedgerErrorId.SEND_TX_FAILED)
    }

    return E.right(response.data.txhash)
  } catch (error) {
    console.log('sendTx error:', error.msg || error.toString())
    return E.left(getErrorId(error))
  }
}

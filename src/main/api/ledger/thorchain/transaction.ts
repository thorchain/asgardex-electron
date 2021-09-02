import type Transport from '@ledgerhq/hw-transport'
import THORChainApp, { extractSignatureFromTLV, LedgerErrorType } from '@thorchain/ledger-thorchain'
import { TxHash } from '@xchainjs/xchain-client'
import { CosmosSDKClient } from '@xchainjs/xchain-cosmos'
import { DEFAULT_GAS_VALUE, getChainId, getPrefix } from '@xchainjs/xchain-thorchain'
import { AssetRuneNative } from '@xchainjs/xchain-util'
import { AccAddress, Msg, PubKeySecp256k1 } from 'cosmos-client'
import { auth, StdTx } from 'cosmos-client/x/auth'
import { MsgSend } from 'cosmos-client/x/bank'
import * as E from 'fp-ts/Either'

import { LedgerErrorId, LedgerTHORTxParams, Network } from '../../../../shared/api/types'
import { getErrorId } from '../utils'
import { fromLedgerErrorType, PATH, toClientNetwork } from './common'

export const sendTx = async ({
  transport,
  network,
  txParams
}: {
  transport: Transport
  network: Network
  txParams: LedgerTHORTxParams
}): Promise<E.Either<LedgerErrorId, TxHash>> => {
  const { recipient, amount, asset = AssetRuneNative, nodeUrl, memo } = txParams
  try {
    const clientNetwork = toClientNetwork(network)
    const prefix = getPrefix(clientNetwork)

    const app = new THORChainApp(transport)
    // get address + public key
    const { bech32Address, returnCode, compressedPk } = await app.showAddressAndPubKey(PATH, prefix)
    if (!bech32Address || !compressedPk || returnCode !== LedgerErrorType.NoErrors) {
      return E.left(fromLedgerErrorType(returnCode))
    }

    const chainId = getChainId()
    // use cosmos sdk
    const sdk = new CosmosSDKClient({
      server: nodeUrl.node,
      chainId,
      prefix: getPrefix(clientNetwork)
    }).sdk

    // get signer address
    const signer = AccAddress.fromBech32(bech32Address)

    console.log('signer:', signer)
    // get account number + sequence from signer account
    const {
      data: {
        result: { account_number, sequence }
      }
    } = await auth.accountsAddressGet(sdk, signer)

    console.log('account_number:', account_number)
    console.log('sequence:', sequence)

    // Create unsigned Msg
    const unsignedMsg: Msg = [
      MsgSend.fromJSON({
        from_address: bech32Address,
        to_address: recipient,
        amount: [
          {
            amount: amount.toString(),
            denom: asset
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
      memo
    })

    console.log('unsignedStdTx:', unsignedStdTx)

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

    console.log('stdTx:', stdTx)

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

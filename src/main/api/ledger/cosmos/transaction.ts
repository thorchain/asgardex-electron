import { AminoMsgSend, AminoTypes, Coin } from '@cosmjs/stargate'
import { cosmosclient, proto, rest } from '@cosmos-client/core'
import CosmosApp from '@ledgerhq/hw-app-cosmos'
import type Transport from '@ledgerhq/hw-transport'
import { Address, TxHash } from '@xchainjs/xchain-client'
import {
  Client,
  DEFAULT_GAS_LIMIT,
  getChainId,
  getDenom,
  protoFee,
  protoAuthInfo,
  protoMsgSend,
  protoTxBody
} from '@xchainjs/xchain-cosmos'
import { Asset, assetToString, BaseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
import * as E from 'fp-ts/Either'
import secp256k1 from 'secp256k1'
import sortKeys from 'sort-keys'

import { LedgerError, LedgerErrorId, Network } from '../../../../shared/api/types'
import { getClientUrls, INITIAL_CHAIN_IDS } from '../../../../shared/cosmos/client'
import { toClientNetwork } from '../../../../shared/utils/client'
import { isError } from '../../../../shared/utils/guard'
import { getDerivationPath } from './common'

const aminoTypes = new AminoTypes({
  // `AminoConverter` for `MsgSend` needed only as we don't handle other Msg here
  '/cosmos.bank.v1beta1.MsgSend': {
    aminoType: 'cosmos-sdk/MsgSend',
    toAmino: ({ from_address, to_address, amount }: proto.cosmos.bank.v1beta1.MsgSend): AminoMsgSend['value'] => ({
      from_address,
      to_address,
      amount:
        // Transform `cosmos.base.v1beta1.ICoin[]` -> `Coin[]` by ignoring all undefined|null denoms & amounts
        amount.reduce<Coin[]>((acc, { denom, amount }) => (!!denom && !!amount ? [...acc, { denom, amount }] : acc), [])
    }),
    //  not needed
    fromAmino: () => {}
  }
})

/**
 * Sends Cosmos tx using Ledger
 */
export const send = async ({
  transport,
  network,
  amount,
  asset,
  feeAmount,
  memo,
  recipient,
  walletIndex
}: {
  transport: Transport
  network: Network
  amount: BaseAmount
  asset: Asset
  feeAmount: BaseAmount
  recipient: Address
  memo?: string
  walletIndex: number
}): Promise<E.Either<LedgerError, TxHash>> => {
  try {
    const clientNetwork = toClientNetwork(network)

    const denom = getDenom(asset)

    if (!denom)
      throw Error(`Invalid asset ${assetToString(asset)} - Only ATOM asset is currently supported to transfer`)

    const gasLimit = new BigNumber(DEFAULT_GAS_LIMIT)

    const fee = protoFee({ denom, amount: feeAmount, gasLimit })

    const clientUrls = getClientUrls()
    const chainId = await getChainId(clientUrls[clientNetwork])

    const app = new CosmosApp(transport)
    const path = getDerivationPath(walletIndex)

    const { publicKey, address: sender } = await app.getAddress(path, 'cosmos')
    const senderAcc = cosmosclient.AccAddress.fromString(sender)

    const client = new Client({
      network: clientNetwork,
      clientUrls,
      chainIds: { ...INITIAL_CHAIN_IDS, [network]: chainId }
    })

    const sdk = client.getSDKClient()
    const account = await sdk.getAccount(senderAcc)
    const { sequence, account_number } = account
    if (!sequence) throw Error(`Transfer failed - missing sequence`)
    if (!account_number) throw Error(`Transfer failed - missing account number`)

    const sendMsg = protoMsgSend({ from: sender, to: recipient, amount, denom })

    // Transform `MsgSend` (proto) -> `MsgSend` (amino)
    const sendMsgAmino = aminoTypes.toAmino({ typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: sendMsg })

    // Note: `Msg` to sign needs to be in Amino format due Ledger limitation - currently no Ledger support for proto
    // Note2: Keys need to be sorted for Ledger
    const msgToSign = JSON.stringify(
      sortKeys(
        {
          chain_id: chainId,
          // Transform JSON of `Fee` (proto) to JSON of `Fee` (amino)
          fee: {
            amount: fee.toJSON().amount,
            gas: fee.toJSON().gas_limit
          },
          memo: memo || '',
          msgs: [sendMsgAmino],
          sequence: sequence.toString(),
          account_number: account_number.toString()
        },
        { deep: true }
      )
    )

    const sigResult = await app.sign(path, msgToSign)

    if (!sigResult || !sigResult?.signature) {
      let signErrorMsg = ''

      if (!sigResult) {
        signErrorMsg = `Signing tx on Ledger failed`
      }

      if (!sigResult.signature) {
        signErrorMsg = `No signature created`
      }

      const signErrorCode = sigResult.return_code.toString() ?? ''

      if (!signErrorMsg && signErrorCode !== '0x9000') {
        signErrorMsg = `Signing tx on Ledger failed - error code ${signErrorCode}`
      }

      return E.left({
        errorId: LedgerErrorId.SIGN_FAILED,
        msg: signErrorMsg
      })
    }

    const txBody = protoTxBody({ from: sender, to: recipient, amount, denom, memo })

    const secPubKey = new proto.cosmos.crypto.secp256k1.PubKey()
    secPubKey.key = new Uint8Array(Buffer.from(publicKey, 'hex'))

    const authInfo = protoAuthInfo({
      pubKey: secPubKey,
      sequence,
      fee,
      mode: proto.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_LEGACY_AMINO_JSON
    })

    const secpSignature = secp256k1.signatureImport(new Uint8Array(sigResult.signature))

    const txBuilder = new cosmosclient.TxBuilder(sdk.sdk, txBody, authInfo)
    txBuilder.addSignature(secpSignature)

    const res = await rest.tx.broadcastTx(sdk.sdk, {
      tx_bytes: txBuilder.txBytes(),
      mode: rest.tx.BroadcastTxMode.Sync
    })

    if (res?.data?.tx_response?.code !== 0) {
      return E.left({
        errorId: LedgerErrorId.INVALID_RESPONSE,
        msg: `Broadcasting ${assetToString(asset)} tx failed - error code ${res?.data?.tx_response?.raw_log} `
      })
    }

    if (!res.data?.tx_response?.txhash) {
      return E.left({
        errorId: LedgerErrorId.INVALID_RESPONSE,
        msg: `Missing tx hash - broadcasting ${assetToString(asset)} tx failed - `
      })
    }

    return E.right(res.data.tx_response.txhash)
  } catch (error) {
    return E.left({
      errorId: LedgerErrorId.SEND_TX_FAILED,
      msg: isError(error) ? error?.message ?? error.toString() : `${error}`
    })
  }
}

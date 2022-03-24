import { ChainId, DEPOSIT_GAS_VALUE, getChainId, ThorchainDepositResponse } from '@xchainjs/xchain-thorchain'
import axios from 'axios'
import { AccAddress, Msg, codec } from 'cosmos-client'
import { TransactionsApi } from 'cosmos-client/api'
import { StdTx } from 'cosmos-client/x/auth'
import {
  MsgMultiSend,
  MsgSend
  // bank
} from 'cosmos-client/x/bank'

// MsgNativeTx (legacy)
// Copied from (deprecated) xchain-thorchain@0.23.0
// https://github.com/xchainjs/xchainjs-lib/blob/979db1d9207ecbd7875cbd61b1c48b67cc9a6a5c/packages/xchain-thorchain/src/types/messages.ts
export type MsgCoin = {
  asset: string
  amount: string
}

// MsgNativeTx (legacy)
// Copied from (deprecated) xchain-thorchain@0.23.0
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
export const msgNativeTxFromJson = (value: { coins: MsgCoin[]; memo: string; signer: string }): MsgNativeTx => {
  return new MsgNativeTx(value.coins, value.memo, AccAddress.fromBech32(value.signer))
}

// Helper to register codecs
// Copied from (deprecated) xchain-thorchain@0.23.0
// https://github.com/xchainjs/xchainjs-lib/blob/979db1d9207ecbd7875cbd61b1c48b67cc9a6a5c/packages/xchain-thorchain/src/util.ts#L115-L127
export const registerCodecs = (prefix: string): void => {
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
export const txsPost = (nodeUrl: string, tx: StdTx, sequence: number) => {
  const url = `${nodeUrl}`
  const txValue = JSON.parse(codec.toJSONString(tx)).value
  // Tweak: THORChain `txs` expects `sequence` in `signatures`
  txValue.signatures[0].sequence = sequence.toString()
  return new TransactionsApi(undefined, url).txsPost({
    tx: txValue,
    mode: 'sync'
  })
}

// Deprecated (legacy) buildDepositTx
// Needed to support Ledger (still amino encoding)
// Copied from (deprecated) xchain-thorchain@0.23.0
// https://github.com/xchainjs/xchainjs-lib/blob/979db1d9207ecbd7875cbd61b1c48b67cc9a6a5c/packages/xchain-thorchain/src/util.ts#L232-L269
export const buildDepositTx = async ({
  msgNativeTx,
  nodeUrl,
  chainId
}: {
  msgNativeTx: MsgNativeTx
  nodeUrl: string
  chainId: ChainId
}): Promise<StdTx> => {
  const networkChainId = await getChainId(nodeUrl)
  if (!networkChainId || chainId !== networkChainId)
    throw new Error(`Invalid network (asked: ${chainId} / returned: ${networkChainId}`)

  const response: ThorchainDepositResponse = (
    await axios.post(`${nodeUrl}/thorchain/deposit`, {
      coins: msgNativeTx.coins,
      memo: msgNativeTx.memo,
      base_req: {
        chain_id: chainId,
        from: msgNativeTx.signer
      }
    })
  ).data

  if (!response || !response.value) throw new Error('Invalid client url')

  const fee = response.value?.fee ?? { amount: [] }

  const unsignedStdTx = StdTx.fromJSON({
    msg: response.value.msg,
    // override fee
    fee: { ...fee, gas: DEPOSIT_GAS_VALUE },
    signatures: [],
    memo: ''
  })

  return unsignedStdTx
}

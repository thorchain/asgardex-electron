import TransportNodeHidSingleton from '@ledgerhq/hw-transport-node-hid-singleton'
import { TxHash } from '@xchainjs/xchain-client'
import { Chain, THORChain } from '@xchainjs/xchain-util'
import * as E from 'fp-ts/Either'

import { LedgerErrorId, LedgerTHORTxParams, LedgerTxParams, Network } from '../../../shared/api/types'
import { sendTx as sendTHORTx } from './thorchain/transaction'
import { getErrorId } from './utils'

export const sendTx = async ({
  chain,
  network,
  txParams
}: {
  chain: Chain
  network: Network
  txParams: LedgerTxParams
}): Promise<E.Either<LedgerErrorId, TxHash>> => {
  console.log('main sendTx:', network, txParams)
  try {
    const transport = await TransportNodeHidSingleton.open()
    let res: E.Either<LedgerErrorId, string>
    switch (chain) {
      case THORChain:
        // TODO (@veado) create/use type guard for LedgerTHORTxParams
        res = await sendTHORTx({ transport, network, txParams: txParams as LedgerTHORTxParams })
        break
      default:
        res = E.left(LedgerErrorId.NO_APP)
    }
    await transport.close()
    return res
  } catch (error) {
    return E.left(getErrorId(error.toString()))
  }
}

// async signAndBroadcast(unsignedStdTx: StdTx, privkey: PrivKey, signer: AccAddress): Promise<BroadcastTxCommitResult> {
//   this.setPrefix()

//   let account: BaseAccount = (await auth.accountsAddressGet(this.sdk, signer)).data.result
//   if (account.account_number === undefined) {
//     account = BaseAccount.fromJSON((account as BaseAccountResponse).value)
//   }

//   const signedStdTx = auth.signStdTx(
//     this.sdk,
//     privkey,
//     unsignedStdTx,
//     account.account_number.toString(),
//     account.sequence.toString(),
//   )

//   return (await auth.txsPost(this.sdk, signedStdTx, 'block')).data
// }

// export const signTx = async ({
//   walletIndex = 0,
//   amount,
//   asset = AssetRuneNative,
//   recipient,
//   memo
// }: TxParams): Promise<BroadcastTxCommitResult> => {

//   getAddressAndPubKey
//   const msg: Msg = [
//     MsgSend.fromJSON({
//       from_address: from,
//       to_address: recipient,
//       amount: [
//         {
//           amount: amount.toString(),
//           denom: asset
//         }
//       ]
//     })
//   ]
//   const signatures: StdTxSignature[] = []

//   const unsignedStdTx = StdTx.fromJSON({
//     msg,
//     fee,
//     signatures,
//     memo
//   })

//   return Promise.reject(Error('no sign/broadcast'))
// }

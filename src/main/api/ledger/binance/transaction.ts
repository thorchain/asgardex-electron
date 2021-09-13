import * as E from 'fp-ts/lib/Either'

import { LedgerErrorId } from '../../../../shared/api/types'

export const send = () =>
  Promise.reject(
    E.left({
      errorId: LedgerErrorId.SEND_TX_FAILED,
      msg: `Sending BNB tx using Ledger has not been implemented`
    })
  )

// !!-----!!
// All of the following will be implemented with another PR
// !!-----!!

// export const sendTx = async (
//   transport: TransportNodeHid,
//   network: Network,
//   txInfo: LedgerBNCTxInfo
// ): Promise<E.Either<LedgerErrorId, string>> => {
//   try {
//     const { sender, recipient, asset, amount, memo } = txInfo
//     const client = new Client({ network: getClientNetwork(network)})
//     const app = new AppBNB(transport)
//     const derive_path = getDerivePath(0)
//     const hpr = network === 'testnet' ? 'tbnb' : 'bnb' // This will be replaced later with "const hpr = client.getPrefix()"
//     await app.showAddress(hpr, derive_path)

//     const bncClient = client.getBncClient()
//     bncClient.initChain()

//     bncClient.useLedgerSigningDelegate(
//       app,
//       () => {},
//       () => {},
//       () => {},
//       derive_path
//     )

//     const transferResult = await bncClient.transfer(
//       sender,
//       recipient,
//       baseToAsset(amount).amount().toString(),
//       asset ? asset.symbol : AssetBNB.symbol,
//       memo
//     )

//     return E.right(transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0])
//   } catch (error) {
//     return E.left(getErrorId(error.toString()))
//   }
// }

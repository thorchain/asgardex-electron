// Note: Disabled temporary due sign issues on macOS

// import AppBTC from '@ledgerhq/hw-app-btc'
// import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
// import { broadcastTx, createTxInfo, getDerivePath } from '@xchainjs/xchain-bitcoin'
// import * as E from 'fp-ts/Either'

// import { LedgerBTCTxInfo, LedgerErrorId, Network } from '../../../shared/api/types'
// import { getErrorId } from './utils'

// export const getAddress = async (transport: TransportNodeHid, network: Network) => {
//   try {
//     const app = new AppBTC(transport)
//     const derive_path = getDerivePath(0)
//     const info = await app.getWalletPublicKey(network === 'testnet' ? derive_path.testnet : derive_path.mainnet, {
//       format: 'bech32'
//     })

//     return E.right(info.bitcoinAddress)
//   } catch (error) {
//     return E.left(getErrorId(error.toString()))
//   }
// }

// export const sendTx = async (
//   transport: TransportNodeHid,
//   network: Network,
//   txInfo: LedgerBTCTxInfo
// ): Promise<E.Either<LedgerErrorId, string>> => {
//   try {
//     const app = new AppBTC(transport)
//     const derive_path = getDerivePath(0)
//     const { utxos, newTxHex } = await createTxInfo({
//       ...txInfo,
//       network: network === 'testnet' ? 'testnet' : 'mainnet'
//     })
//     const txs = utxos.map((utxo) => {
//       return {
//         tx: app.splitTransaction(utxo.txHex, true),
//         ...utxo
//       }
//     })
//     const newTx = app.splitTransaction(newTxHex, true)
//     const outputScriptHex = app.serializeTransactionOutputs(newTx).toString('hex')
//     const txHex = await app.createPaymentTransactionNew({
//       inputs: txs.map((utxo) => {
//         return [utxo.tx, utxo.index, null, null]
//       }),
//       associatedKeysets: txs.map((_) => (network === 'testnet' ? derive_path.testnet : derive_path.mainnet)),
//       outputScriptHex,
//       segwit: true,
//       additionals: ['bitcoin', 'bech32']
//     })
//     const txHash = await broadcastTx({ txHex, nodeUrl: txInfo.nodeUrl, nodeApiKey: txInfo.nodeApiKey })

//     return E.right(txHash)
//   } catch (error) {
//     return E.left(getErrorId(error.toString()))
//   }
// }

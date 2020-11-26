import AppBtc from '@ledgerhq/hw-app-btc'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'

export const getBTCAddress = async () => {
  const transport = await TransportNodeHid.open('')
  const appBtc = new AppBtc(transport)
  const info = await appBtc.getWalletPublicKey("44'/0'/0'/0/0")
  await transport.close()
  return info.bitcoinAddress
}

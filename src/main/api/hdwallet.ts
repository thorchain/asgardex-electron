import AppBtc from '@ledgerhq/hw-app-btc'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { ipcRenderer } from 'electron'

import { ApiHDWallet } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'

export const getBTCAddress = async () => {
  const transport = await TransportNodeHid.open('')
  const appBtc = new AppBtc(transport)
  const info = await appBtc.getWalletPublicKey("44'/0'/0'/0/0")
  await transport.close()
  return info.bitcoinAddress
}

export const apiHDWallet: ApiHDWallet = {
  getBTCAddress: () => ipcRenderer.invoke(IPCMessages.GET_BTC_ADDRESS)
}

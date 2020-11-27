import { Network } from '@xchainjs/xchain-client'
import { ipcRenderer } from 'electron'

import { ApiHDWallet } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'

export const apiHDWallet: ApiHDWallet = {
  getBTCAddress: (network: Network) => ipcRenderer.invoke(IPCMessages.GET_BTC_ADDRESS, network)
}

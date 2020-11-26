import { ipcRenderer } from 'electron'

import { ApiHDWallet } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'

export const apiHDWallet: ApiHDWallet = {
  getBTCAddress: () => ipcRenderer.invoke(IPCMessages.GET_BTC_ADDRESS)
}

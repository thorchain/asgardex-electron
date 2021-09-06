import { ipcRenderer } from 'electron'

import { ipcLedgerSendTxParams, IPCLedgerSendTxParams } from '../../shared/api/io'
import { IPCLedgerAdddressParams } from '../../shared/api/types'
import { ApiHDWallet } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'

export const apiHDWallet: ApiHDWallet = {
  getLedgerAddress: (params: IPCLedgerAdddressParams) => ipcRenderer.invoke(IPCMessages.GET_LEDGER_ADDRESS, params),
  sendLedgerTx: (params: IPCLedgerSendTxParams) => {
    console.log('sendLedgerTx params', params)
    const encoded = ipcLedgerSendTxParams.encode(params)
    console.log('sendLedgerTx encoded', encoded)
    return ipcRenderer.invoke(IPCMessages.SEND_LEDGER_TX, encoded)
  }
}

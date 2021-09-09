import { ipcRenderer } from 'electron'

import { IPCLedgerAdddressParams } from '../../shared/api/types'
import { ApiHDWallet } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'

export const apiHDWallet: ApiHDWallet = {
  getLedgerAddress: (params: IPCLedgerAdddressParams) => ipcRenderer.invoke(IPCMessages.GET_LEDGER_ADDRESS, params),
  // Note: `params` need to be encoded by `ipcLedgerSendTxParamsIO` before calling `sendLedgerTx`  */
  sendLedgerTx: (params: unknown) => ipcRenderer.invoke(IPCMessages.SEND_LEDGER_TX, params)
}

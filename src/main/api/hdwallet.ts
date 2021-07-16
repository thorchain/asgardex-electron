import { Chain } from '@xchainjs/xchain-util'
import { ipcRenderer } from 'electron'

import { LedgerTxInfo, Network } from '../../shared/api/types'
import { ApiHDWallet } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'

export const apiHDWallet: ApiHDWallet = {
  getLedgerAddress: (chain: Chain, network: Network) =>
    ipcRenderer.invoke(IPCMessages.GET_LEDGER_ADDRESS, chain, network),
  sendTxInLedger: (chain: Chain, network: Network, txInfo: LedgerTxInfo) =>
    ipcRenderer.invoke(IPCMessages.SEND_LEDGER_TX, chain, network, txInfo),
  getTransport: () => ipcRenderer.invoke(IPCMessages.GET_TRANSPORT)
}

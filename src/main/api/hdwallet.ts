import { Chain } from '@xchainjs/xchain-util'
import { ipcRenderer } from 'electron'

import { GetLedgerAddressParams, LedgerTxInfo, Network } from '../../shared/api/types'
import { ApiHDWallet } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'

export const apiHDWallet: ApiHDWallet = {
  getLedgerAddress: (args: GetLedgerAddressParams) => ipcRenderer.invoke(IPCMessages.GET_LEDGER_ADDRESS, args),
  sendTxInLedger: (chain: Chain, network: Network, txInfo: LedgerTxInfo) =>
    ipcRenderer.invoke(IPCMessages.SEND_LEDGER_TX, chain, network, txInfo)
}

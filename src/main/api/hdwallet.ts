import { Chain } from '@xchainjs/xchain-util'
import { ipcRenderer } from 'electron'

import { Network } from '../../shared/api/types'
import { ApiHDWallet } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'

export const apiHDWallet: ApiHDWallet = {
  getLedgerAddress: (chain: Chain, network: Network) =>
    ipcRenderer.invoke(IPCMessages.GET_LEDGER_ADDRESS, chain, network)
}

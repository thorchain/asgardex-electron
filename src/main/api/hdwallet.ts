import { LedgerTxInfo } from '@xchainjs/xchain-bitcoin'
import { Chain } from '@xchainjs/xchain-util'
import { ipcRenderer } from 'electron'

import { Network } from '../../shared/api/types'
import { ApiHDWallet } from '../../shared/api/types'
import IPCMessages from '../ipc/messages'

export const apiHDWallet: ApiHDWallet = {
  getLedgerAddress: (chain: Chain, network: Network) =>
    ipcRenderer.invoke(IPCMessages.GET_LEDGER_ADDRESS, chain, network),
  signTxInLedger: (chain: Chain, network: Network, ledgerTxInfo: LedgerTxInfo) =>
    ipcRenderer.invoke(IPCMessages.SIGN_LEDGER_TX, chain, network, ledgerTxInfo)
}

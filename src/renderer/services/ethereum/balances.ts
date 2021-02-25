import { Asset } from '@xchainjs/xchain-util'

import { triggerStream } from '../../helpers/stateHelper'
import * as C from '../clients'
import { client$ } from './common'

// `TriggerStream` to reload `Balances`
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

// State of balances loaded by Client
const balances$: (assets?: Asset[]) => C.WalletBalancesLD = (assets?: Asset[]) =>
  C.balances$(client$, reloadBalances$, assets)

export { reloadBalances, balances$ }

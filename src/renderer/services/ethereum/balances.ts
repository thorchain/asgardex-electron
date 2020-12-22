import { triggerStream } from '../../helpers/stateHelper'
import * as C from '../clients'
import { client$ } from './common'

// `TriggerStream` to reload `Balances`
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

// State of balances loaded by Client
const balances$: C.WalletBalancesLD = C.balances$(client$, reloadBalances$)

export { reloadBalances, balances$ }

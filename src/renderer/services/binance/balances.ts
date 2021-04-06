import { triggerStream } from '../../helpers/stateHelper'
import * as C from '../clients'
import { client$ } from './common'

const { stream$: reloadBalances$, trigger: reloadBalances, reset: resetReload } = triggerStream()

// State of balances loaded by Client
const balances$: C.WalletBalancesLD = C.balances$(client$, reloadBalances$)

export { balances$, reloadBalances, reloadBalances$, resetReload }

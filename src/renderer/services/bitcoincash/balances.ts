import { observableState /*, triggerStream */ } from '../../helpers/stateHelper'
import * as C from '../clients'
import { client$ } from './common'

const { get$: reloadBalances$, set: setReload } = observableState<'trigger' | ''>('')

const reloadBalances = (state: 'trigger' | '' = 'trigger') => {
  setReload(state)
}

// State of balances loaded by Client
const balances$: C.WalletBalancesLD = C.balances$(client$, reloadBalances$)

export { balances$, reloadBalances, reloadBalances$ }

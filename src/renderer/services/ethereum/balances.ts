import { Asset } from '@xchainjs/xchain-util'

import { triggerStream } from '../../helpers/stateHelper'
import * as C from '../clients'
import { client$ } from './common'

// `TriggerStream` to reload `Balances`
// Note: Currently we use same `triggerStream` for two created streams (testnet and mainnet) of `balances$`
// As long as we can switch between testnet and mainnet, it will be an issue which has to be fixed.
// Because by calling `reloadBalances()` two streams are reloaded currently.
// @asgdx-team: Let's re-think about it ^ ...
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

// State of balances loaded by Client
const balances$: (assets?: Asset[]) => C.WalletBalancesLD = (assets?: Asset[]) =>
  C.balances$(client$, reloadBalances$, assets)

export { reloadBalances, balances$ }

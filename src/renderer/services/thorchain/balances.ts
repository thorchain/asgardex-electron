import { AssetRuneNative } from '@xchainjs/xchain-util'

import { triggerStream } from '../../helpers/stateHelper'
import * as C from '../clients'
import { client$ } from './common'

// `TriggerStream` to reload `Balances`
const { stream$: reloadBalances$, trigger: reloadBalances } = triggerStream()

// State of balances loaded by Client
// Currently in ASGDX `AssetRuneNative` is supported only. Remove asset list if we want to get balances of all assets at THORChain.
const balances$: C.WalletBalancesLD = C.balances$(client$, reloadBalances$, [AssetRuneNative])

export { balances$, reloadBalances }

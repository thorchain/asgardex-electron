import * as RD from '@devexperts/remote-data-ts'

import { observableState } from '../../helpers/stateHelper'
import { LedgerAddressRD } from '../wallet/types'

const { get$: ledgerAddress$, set: setLedgerAddressRD } = observableState<LedgerAddressRD>(RD.initial)

export { ledgerAddress$, setLedgerAddressRD }

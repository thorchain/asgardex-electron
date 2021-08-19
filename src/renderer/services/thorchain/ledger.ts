import { Network } from '../../../shared/api/types'
import { observableState } from '../../helpers/stateHelper'
import { INITIAL_LEDGER_ADDRESS_MAP } from '../wallet/const'
import { LedgerAddressMap, LedgerAddressRD } from '../wallet/types'

const {
  get$: ledgerAddress$,
  get: ledgerAddress,
  set: setLedgerAddress
} = observableState<LedgerAddressMap>(INITIAL_LEDGER_ADDRESS_MAP)

const setLedgerAddressRD = (ledgerAddressRD: LedgerAddressRD, network: Network) =>
  setLedgerAddress({ ...ledgerAddress(), [network]: ledgerAddressRD })

export { ledgerAddress$, setLedgerAddressRD }

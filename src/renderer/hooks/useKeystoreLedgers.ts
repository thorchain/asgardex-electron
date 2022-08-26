import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'

import { useWalletContext } from '../contexts/WalletContext'
import { KeystoreLedgerAddresses, KeystoreLedgerAddressesRD } from '../services/wallet/types'

export const useKeystoreLedgers = (): {
  ledgerAddressesPersistentRD: KeystoreLedgerAddressesRD
  reloadPersistentLedgerAddresses: FP.Lazy<void>
  ledgerAddresses: KeystoreLedgerAddresses
} => {
  const { reloadPersistentLedgerAddresses, persistentLedgerAddresses$, ledgerAddresses$ } = useWalletContext()

  const ledgerAddressesPersistentRD = useObservableState(persistentLedgerAddresses$, RD.initial)
  const ledgerAddresses = useObservableState(ledgerAddresses$, [])

  return { ledgerAddressesPersistentRD, ledgerAddresses, reloadPersistentLedgerAddresses }
}

import { useEffect, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useNavigate } from 'react-router-dom'

import { useWalletContext } from '../contexts/WalletContext'
import * as walletRoutes from '../routes/wallet'
import { INITIAL_KEYSTORE_STATE } from '../services/wallet/const'
import { hasImportedKeystore } from '../services/wallet/util'
import { useKeystoreClientStates } from './useKeystoreClientStates'

/**
 * It redirects to wallet asset view
 * whenever keystore have been imported
 * and ALL clients have been initialized
 *
 * Use this hook in top level *views only (but not in components)
 *
 */
export const useKeystoreRedirectAfterImport = (): void => {
  const navigate = useNavigate()
  const { clientStates } = useKeystoreClientStates()
  const {
    keystoreService: { keystore$ }
  } = useWalletContext()
  const keystore = useObservableState(keystore$, INITIAL_KEYSTORE_STATE)

  const readyToRedirect = useMemo(
    () =>
      FP.pipe(
        clientStates,
        RD.toOption,
        O.map((_) => hasImportedKeystore(keystore)),
        O.getOrElse(() => false)
      ),

    [clientStates, keystore]
  )

  useEffect(() => {
    if (readyToRedirect) {
      // redirect to wallets assets view
      navigate(walletRoutes.assets.path())
    }
  }, [navigate, readyToRedirect])
}

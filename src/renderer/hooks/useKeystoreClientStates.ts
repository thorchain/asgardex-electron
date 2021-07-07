import { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useBinanceContext } from '../contexts/BinanceContext'
import { useBitcoinCashContext } from '../contexts/BitcoinCashContext'
import { useBitcoinContext } from '../contexts/BitcoinContext'
import { useEthereumContext } from '../contexts/EthereumContext'
import { useLitecoinContext } from '../contexts/LitecoinContext'
import { useThorchainContext } from '../contexts/ThorchainContext'
import { useWalletContext } from '../contexts/WalletContext'
import { liveData } from '../helpers/rx/liveData'
import { INITIAL_KEYSTORE_STATE } from '../services/wallet/const'
import { hasImportedKeystore } from '../services/wallet/util'

export type KeystoreClientStates = RD.RemoteData<Error, boolean>

export const useKeystoreClientStates = (): { clientStates: KeystoreClientStates; readyToRedirect: boolean } => {
  const { clientState$: bnbClientState$ } = useBinanceContext()
  const { clientState$: btcClientState$ } = useBitcoinContext()
  const { clientState$: bchClientState$ } = useBitcoinCashContext()
  const { clientState$: ltcClientState$ } = useLitecoinContext()
  const { clientState$: ethClientState$ } = useEthereumContext()
  const { clientState$: thorClientState$ } = useThorchainContext()
  const {
    keystoreService: { keystore$ }
  } = useWalletContext()
  const keystore = useObservableState(keystore$, INITIAL_KEYSTORE_STATE)

  // State of initializing all clients
  const [clientStates] = useObservableState<KeystoreClientStates>(
    () =>
      FP.pipe(
        liveData.sequenceS({
          bnb: bnbClientState$,
          btc: btcClientState$,
          bch: bchClientState$,
          eth: ethClientState$,
          ltc: ltcClientState$,
          thor: thorClientState$
        }),
        liveData.map((_) => true),
        RxOp.startWith(RD.pending)
      ),
    RD.initial
  )

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

  return { clientStates, readyToRedirect }
}

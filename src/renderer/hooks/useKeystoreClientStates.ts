import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import { useObservableState } from 'observable-hooks'
import * as RxOp from 'rxjs/operators'

import { useBinanceContext } from '../contexts/BinanceContext'
import { useBitcoinCashContext } from '../contexts/BitcoinCashContext'
import { useBitcoinContext } from '../contexts/BitcoinContext'
import { useCosmosContext } from '../contexts/CosmosContext'
import { useDogeContext } from '../contexts/DogeContext'
import { useEthereumContext } from '../contexts/EthereumContext'
import { useLitecoinContext } from '../contexts/LitecoinContext'
import { useThorchainContext } from '../contexts/ThorchainContext'
import { liveData } from '../helpers/rx/liveData'

export type KeystoreClientStates = RD.RemoteData<Error, boolean>

export const useKeystoreClientStates = (): { clientStates: KeystoreClientStates } => {
  const { clientState$: bnbClientState$ } = useBinanceContext()
  const { clientState$: btcClientState$ } = useBitcoinContext()
  const { clientState$: bchClientState$ } = useBitcoinCashContext()
  const { clientState$: ltcClientState$ } = useLitecoinContext()
  const { clientState$: ethClientState$ } = useEthereumContext()
  const { clientState$: thorClientState$ } = useThorchainContext()
  const { clientState$: dogeClientState$ } = useDogeContext()
  const { clientState$: cosmosClientState$ } = useCosmosContext()

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
          thor: thorClientState$,
          doge: dogeClientState$,
          cosmos: cosmosClientState$
        }),
        liveData.map((_) => true),
        RxOp.startWith(RD.pending)
      ),
    RD.initial
  )

  return { clientStates }
}

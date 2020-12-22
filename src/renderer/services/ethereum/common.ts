import { Network as ClientNetwork } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-ethereum'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay } from 'rxjs/operators'

import { envOrDefault } from '../../helpers/envHelper'
import { network$ } from '../app/service'
import * as C from '../clients'
import { getClient } from '../clients/utils'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { Client$, ClientState } from './types'

/**
 * Binance network depending on `Network`
 */
const ethereumNetwork$: Observable<ClientNetwork> = network$.pipe(
  map((network) => {
    if (network === 'chaosnet') return 'mainnet'

    return network
  })
)

const BLOCKCHAIR_API_KEY = envOrDefault(process.env.REACT_APP_BLOCKCHAIR_API_KEY, 'undefined blockchair api key')
const BLOCKCHAIR_TESTNET = 'https://api.blockchair.com/ethereum/testnet'
const BLOCKCHAIR_MAINNET = 'https://api.blockchair.com/ethereum'
const ETHERSCAN_API_KEY = envOrDefault(process.env.REACT_APP_ETHERSCAN_API_KEY, 'undefined etherscan api key')

/**
 * Stream to create an observable EthereumClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new EthereumClient will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A EthereumClient will never be created as long as no phrase is available
 */
const clientState$ = Rx.combineLatest([keystoreService.keystore$, ethereumNetwork$]).pipe(
  mergeMap(
    ([keystore, network]) =>
      new Observable((observer: Observer<ClientState>) => {
        const client: ClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const blockchairUrl = network === 'testnet' ? BLOCKCHAIR_TESTNET : BLOCKCHAIR_MAINNET
              const client = new Client({
                network,
                blockchairUrl: blockchairUrl,
                blockchairNodeApiKey: BLOCKCHAIR_API_KEY,
                etherscanApiKey: ETHERSCAN_API_KEY,
                phrase
              })
              return O.some(right(client)) as ClientState
            } catch (error) {
              return O.some(left(error))
            }
          })
        )
        observer.next(client)
      }) as Observable<ClientState>
  )
)

const client$: Client$ = clientState$.pipe(map(getClient), shareReplay(1))

/**
 * `Address`
 */
const address$: C.Address$ = C.address$(client$)

export { client$, clientState$, address$ }

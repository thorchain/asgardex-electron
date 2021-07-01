import { EtherscanProvider } from '@ethersproject/providers'
import * as ETH from '@xchainjs/xchain-ethereum'
import { Asset, assetToString } from '@xchainjs/xchain-util'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { envOrDefault } from '../../helpers/envHelper'
import { clientNetwork$ } from '../app/service'
import * as C from '../clients'
import { Address$, ExplorerUrl$, GetExplorerTxUrl$, GetExplorerAddressUrl$ } from '../clients/types'
import { ClientStateForViews } from '../clients/types'
import { getClient, toClientNetwork, getClientStateForViews } from '../clients/utils'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { Client$, ClientState, ClientState$ } from './types'

const ETHERSCAN_API_KEY = envOrDefault(process.env.REACT_APP_ETHERSCAN_API_KEY, '')
const INFURA_PROJECT_ID = envOrDefault(process.env.REACT_APP_INFURA_PROJECT_ID, '')
const INFURA_PROJECT_SECRET = envOrDefault(process.env.REACT_APP_INFURA_PROJECT_SECRET, '')

const ETHPLORER_API_KEY = envOrDefault(process.env.REACT_APP_ETHPLORER_API_KEY, 'freekey')
const ETHPLORER_API_URL = envOrDefault(process.env.REACT_APP_ETHPLORER_API_URL, 'https://api.ethplorer.io')

/**
 * Stream to create an observable EthereumClient depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new EthereumClient will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A EthereumClient will never be created as long as no phrase is available
 */
const clientState$: ClientState$ = Rx.combineLatest([keystoreService.keystore$, clientNetwork$]).pipe(
  RxOp.switchMap(
    ([keystore, network]) =>
      new Observable((observer: Observer<ClientState>) => {
        const client: ClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const infuraCreds: ETH.InfuraCreds | undefined = INFURA_PROJECT_ID
                ? {
                    projectId: INFURA_PROJECT_ID,
                    projectSecret: INFURA_PROJECT_SECRET
                  }
                : undefined
              const client = new ETH.Client({
                network,
                etherscanApiKey: ETHERSCAN_API_KEY,
                ethplorerApiKey: ETHPLORER_API_KEY,
                ethplorerUrl: ETHPLORER_API_URL,
                phrase,
                infuraCreds
              })
              return O.some(right(client)) as ClientState
            } catch (error) {
              console.error('Failed to create ETH client', error)
              return O.some(left(error))
            }
          })
        )
        observer.next(client)
      }) as Observable<ClientState>
  )
)

const client$: Client$ = clientState$.pipe(RxOp.map(getClient), RxOp.shareReplay(1))

/**
 * Helper stream to provide "ready-to-go" state of latest `EthereumClient`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Observable<ClientStateForViews> = clientState$.pipe(RxOp.map(getClientStateForViews))

/**
 * Current `Address` depending on selected network
 */
const address$: Address$ = C.address$(client$)

/**
 * Current `Address` depending on selected network
 */
const addressUI$: Address$ = C.addressUI$(client$)

/**
 * Explorer url depending on selected network
 */
const explorerUrl$: ExplorerUrl$ = C.explorerUrl$(client$)

/**
 * Explorer url depending on selected network
 */
const getExplorerTxUrl$: GetExplorerTxUrl$ = C.getExplorerTxUrl$(client$)

/**
 * Explorer url depending on selected network
 */
const getExplorerAddressUrl$: GetExplorerAddressUrl$ = C.getExplorerAddressUrl$(client$)

/**
 * Map to store decimal in memory
 *
 * to avoid unessary request for same data
 * */
const decimalMap: Map<string, number> = new Map()
/**
 * Helper to get decimals for ERC20
 */
const getDecimal = async (asset: Asset, network: Network): Promise<number> => {
  const assetString = assetToString(asset)
  return FP.pipe(
    decimalMap.get(assetString),
    O.fromNullable,
    O.fold(
      async () => {
        const ethNetwork = toClientNetwork(network)
        const provider = new EtherscanProvider(ethNetwork, ETHERSCAN_API_KEY)
        try {
          const decimal = await ETH.getDecimal(asset, provider)
          // store result in memory
          decimalMap.set(assetString, decimal)
          return Promise.resolve(decimal)
        } catch (e) {
          return Promise.reject(e)
        }
      },
      async (decimal) => Promise.resolve(decimal)
    )
  )
}

export {
  client$,
  clientState$,
  clientViewState$,
  address$,
  addressUI$,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$,
  getDecimal as getERC20Decimal
}

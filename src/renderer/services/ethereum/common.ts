import * as RD from '@devexperts/remote-data-ts'
import { EtherscanProvider } from '@ethersproject/providers'
import * as ETH from '@xchainjs/xchain-ethereum'
import { Asset, assetToString, ETHChain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { envOrDefault } from '../../../shared/utils/env'
import { isError } from '../../../shared/utils/guard'
import { clientNetwork$ } from '../app/service'
import * as C from '../clients'
import { WalletAddress$, ExplorerUrl$ } from '../clients/types'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { Client$, ClientState, ClientState$ } from './types'

const ETHERSCAN_API_KEY = envOrDefault(import.meta.env.REACT_APP_ETHERSCAN_API_KEY, '')
const INFURA_PROJECT_ID = envOrDefault(import.meta.env.REACT_APP_INFURA_PROJECT_ID, '')
const INFURA_PROJECT_SECRET = envOrDefault(import.meta.env.REACT_APP_INFURA_PROJECT_SECRET, '')

const ETHPLORER_API_KEY = envOrDefault(import.meta.env.REACT_APP_ETHPLORER_API_KEY, 'freekey')
const ETHPLORER_API_URL = envOrDefault(import.meta.env.REACT_APP_ETHPLORER_API_URL, 'https://api.ethplorer.io')

/**
 * Stream to create an observable `EthereumClient` depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new `EthereumClient` will be created.
 * By the other hand: Whenever a phrase has been removed, `ClientState` is set to `initial`
 * A `EthereumClient` will never be created as long as no phrase is available
 */
const clientState$: ClientState$ = FP.pipe(
  Rx.combineLatest([keystoreService.keystore$, clientNetwork$]),
  RxOp.switchMap(
    ([keystore, network]): ClientState$ =>
      Rx.of(
        FP.pipe(
          getPhrase(keystore),
          O.map<string, ClientState>((phrase) => {
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
              return RD.success(client)
            } catch (error) {
              return RD.failure<Error>(isError(error) ? error : new Error('Failed to create ETH client'))
            }
          }),
          // Set back to `initial` if no phrase is available (locked wallet)
          O.getOrElse<ClientState>(() => RD.initial)
        )
      ).pipe(RxOp.startWith(RD.pending))
  ),
  RxOp.startWith<ClientState>(RD.initial),
  RxOp.shareReplay(1)
)

const client$: Client$ = clientState$.pipe(RxOp.map(RD.toOption), RxOp.shareReplay(1))

/**
 * Current `Address` depending on selected network
 */
const address$: WalletAddress$ = C.address$(client$, ETHChain)

/**
 * Current `Address` depending on selected network
 */
const addressUI$: WalletAddress$ = C.addressUI$(client$, ETHChain)

/**
 * Explorer url depending on selected network
 */
const explorerUrl$: ExplorerUrl$ = C.explorerUrl$(client$)

/**
 * Map to store decimal in memory
 *
 * to avoid unessary request for same data
 * */
const decimalMap: Map<string, number> = new Map()
/**
 * Helper to get decimals for ERC20
 */
const getERC20Decimal = async (asset: Asset, network: Network): Promise<number> => {
  const assetString = assetToString(asset)
  return FP.pipe(
    decimalMap.get(assetString),
    O.fromNullable,
    O.fold(
      async () => {
        // https://docs.ethers.io/v5/api/providers/api-providers/#EtherscanProvider
        const ethNetwork = network === 'testnet' ? 'ropsten' : 'homestead'
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

export { client$, clientState$, address$, addressUI$, explorerUrl$, getERC20Decimal }

import { Address } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as RxOp from 'rxjs/operators'

import { Chain } from '../../../shared/utils/chain'
import { WalletAddress } from '../../../shared/wallet/types'
import { removeAddressPrefix } from '../../helpers/addressHelper'
import { eqOString } from '../../helpers/fp/eq'
import { WalletAddress$, XChainClient$ } from '../clients/types'

export const addressUI$: (client$: XChainClient$, chain: Chain) => WalletAddress$ = (client$, chain) =>
  client$.pipe(
    RxOp.map(
      O.chain((client) =>
        O.tryCatch(() =>
          client.getAddress(
            /* TODO (@asgdx team) Check if we still can use `0` as default index in the future by introducing HD wallets */
            0
          )
        )
      )
    ),
    RxOp.distinctUntilChanged(eqOString.equals),
    RxOp.map(
      FP.flow(
        O.map<Address, WalletAddress>((address) => ({
          address,
          chain,
          type: 'keystore',
          walletIndex: 0 /* As long as we don't have HD wallets introduced, keystore will be always 0 */,
          hdMode: 'default'
        }))
      )
    ),
    RxOp.shareReplay(1)
  )

export const address$: (client$: XChainClient$, chain: Chain) => WalletAddress$ = (client$, chain) =>
  FP.pipe(
    addressUI$(client$, chain),
    RxOp.map(O.map((wAddress: WalletAddress) => ({ ...wAddress, address: removeAddressPrefix(wAddress.address) })))
  )

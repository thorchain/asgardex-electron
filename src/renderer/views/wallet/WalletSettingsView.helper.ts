import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { WalletAddress$ } from '../../services/clients'
import { WalletAccount, WalletAddressAsync } from '../../services/wallet/types'

export const walletAccount$ = ({
  addressUI$,
  ledgerAddress,
  chain
}: {
  addressUI$: WalletAddress$
  ledgerAddress?: WalletAddressAsync
  chain: Chain
}): Rx.Observable<O.Option<WalletAccount>> =>
  FP.pipe(
    addressUI$, // all `keystore` based
    RxOp.map(
      O.map((walletAddress) => {
        const keystoreAddress: WalletAddressAsync = {
          type: walletAddress.type,
          address: RD.success(walletAddress)
        }
        const accounts = ledgerAddress ? [keystoreAddress, ledgerAddress] : [keystoreAddress]
        return {
          chain,
          accounts
        }
      })
    )
  )

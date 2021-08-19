import * as RD from '@devexperts/remote-data-ts'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Address$ } from '../../services/clients'
import { WalletAccount, WalletAddress } from '../../services/wallet/types'

export const walletAccount$ = ({
  addressUI$,
  ledgerAddress,
  chain
}: {
  addressUI$: Address$
  ledgerAddress?: WalletAddress
  chain: Chain
}): Rx.Observable<O.Option<WalletAccount>> =>
  FP.pipe(
    addressUI$,
    RxOp.map(
      O.map((address) => {
        const keystoreAddress: WalletAddress = {
          type: 'keystore',
          address: RD.success(address)
        }
        const accounts = ledgerAddress ? [keystoreAddress, ledgerAddress] : [keystoreAddress]
        return {
          chain,
          accounts
        }
      })
    )
  )

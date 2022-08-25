import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { WalletAddress } from '../../../shared/wallet/types'
import { sequenceTOption } from '../../helpers/fpHelpers'
import { WalletAddress$ } from '../../services/clients'
import { WalletAccount } from '../../services/wallet/types'

export const walletAccount$ = ({
  addressUI$,
  ledgerAddress: oLedgerAddress,
  chain
}: {
  addressUI$: WalletAddress$
  ledgerAddress: O.Option<WalletAddress>
  chain: Chain
}): Rx.Observable<O.Option<WalletAccount>> =>
  FP.pipe(
    addressUI$, // all `keystore` based
    RxOp.map((okeystoreAddress) =>
      FP.pipe(
        // Take keystore + ledger into account
        sequenceTOption(okeystoreAddress, oLedgerAddress),
        // Or try to add keystore account if ledger is not available
        O.alt(() =>
          FP.pipe(
            okeystoreAddress,
            O.map((keystoreAddress) => [keystoreAddress])
          )
        ),
        O.map((accounts) => ({ chain, accounts }))
      )
    )
  )

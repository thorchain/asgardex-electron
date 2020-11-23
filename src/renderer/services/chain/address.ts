import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'

import { Address$, address$ } from '../clients'
import { client$ } from './client'

/**
 * Users wallet address for selected pool asset
 */
const assetAddress$: Address$ = address$(client$)

/**
 * Users wallet address for RUNE
 */
// TODO(@veado): Add Rune address when `xchain-thorchain` has been introduced
// https://github.com/thorchain/asgardex-electron/issues/601
const runeAddress$: Address$ = Rx.of(O.none)

export { assetAddress$, runeAddress$ }

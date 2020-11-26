import * as C from '../clients'
import { Address$ } from '../clients'
import { client$ } from './common'

export const address$: Address$ = C.address$(client$)

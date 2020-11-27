import { address$ } from '../clients'
import { Address$ } from '../clients/types'
import { client$ } from './client'

/**
 * Users wallet address for selected pool asset
 */
const assetAddress$: Address$ = address$(client$)

export { assetAddress$ }

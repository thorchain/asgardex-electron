import * as A from 'fp-ts/lib/Array'

import { eqChain } from './eq'

/**
 * Merges array of `Chain` and removes duplications
 */
export const unionChains = A.union(eqChain)

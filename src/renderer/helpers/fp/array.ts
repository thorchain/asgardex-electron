import * as A from 'fp-ts/lib/Array'

import { eqAsset, eqChain } from './eq'

/**
 * Merges array of `Chain` and removes duplications
 */
export const unionChains = A.union(eqChain)

/**
 * Merges array of `Assets` and removes duplications
 */
export const unionAssets = A.union(eqAsset)

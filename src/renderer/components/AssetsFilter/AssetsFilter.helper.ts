import { Asset, Chain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/NonEmptyArray'
import * as O from 'fp-ts/Option'

import { ENABLED_CHAINS } from '../../services/const'
import { PoolFilters } from '../../services/midgard/types'

/**
 * Filters availableChains array by passed assets array.
 * If assets array does not contain any asset for appropriate chain
 * this chain will be filtered out from result array
 *
 * in case there is no any asset matched to availableChains by chain will return O.none
 */
export const getAvailableChains = (assets: Asset[], availableChains: Chain[] = ENABLED_CHAINS): O.Option<PoolFilters> =>
  FP.pipe(
    NEA.fromArray(assets),
    O.chain((assets) =>
      NEA.fromArray(
        FP.pipe(
          availableChains,
          A.filterMap((chain) =>
            FP.pipe(
              assets,
              A.findFirstMap(({ chain: assetChain }) => (chain === assetChain ? O.some(chain) : O.none))
            )
          )
        )
      )
    ),
    // In case there is at least one Filter available add Base filter
    O.map((chainFilters) => ['base', 'usd', ...chainFilters])
  )

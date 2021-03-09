import { Asset, Chain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/NonEmptyArray'
import * as O from 'fp-ts/Option'

import { isChainAsset } from '../../helpers/assetHelper'
import { eqChain } from '../../helpers/fp/eq'
import { ENABLED_CHAINS } from '../../services/const'

export const BASE_FILTER = 'base'
export type Filter = Chain | typeof BASE_FILTER

export type Filters = Filter[]

/**
 * Filters availableChains array by passed assets array.
 * If assets array does not contain any asset for appropriate chain
 * this chain will be filtered out from result array
 *
 * in case there is no any asset matched to availableChains by chain will return O.none
 */
export const getAvailableChains = (assets: Asset[], availableChains: Chain[] = ENABLED_CHAINS): O.Option<Filters> =>
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
    O.map((chainFilters) => [BASE_FILTER, ...chainFilters])
  )

/**
 * Filters assets array by passed active chain-filter.
 * If oFilter is O.none will return assets array without any changes
 */
export const filterAssets = (assets: Asset[]) => (oFilter: O.Option<Filter>): Asset[] =>
  FP.pipe(
    oFilter,
    O.map((filter) =>
      FP.pipe(
        assets,
        A.filterMap((asset) => {
          if (filter === BASE_FILTER) {
            // For 'base' filter we get ONLY chain assets
            if (isChainAsset(asset)) {
              return O.some(asset)
            }
            // In all other cases filter it out
            return O.none
          }

          // For non-'base' activeFilter filter assets by chain according to the activeFilter
          return eqChain.equals(filter, asset.chain) ? O.some(asset) : O.none
        })
      )
    ),
    // In case there is no activeFilter setup return all available assets
    O.getOrElse(() => assets)
  )

import React, { useCallback, useMemo, useState } from 'react'

import { StopOutlined } from '@ant-design/icons/lib'
import { Asset, Chain } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as NEA from 'fp-ts/NonEmptyArray'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { isChainAsset } from '../../helpers/assetHelper'
import { eqChain } from '../../helpers/fp/eq'
import { ENABLED_CHAINS } from '../../services/const'
import * as Styled from './AssetsFilter.styles'

type Props = {
  assets?: Asset[]
  onFilterChanged: (filteredAssets: Asset[]) => void
  className?: string
}

const BASE_FILTER = 'base'
type Filter = Chain | typeof BASE_FILTER

type Filters = Filter[]

export const AssetsFilter: React.FC<Props> = ({ assets = [], onFilterChanged, className }) => {
  const [activeFilter, setActiveFilterState] = useState<O.Option<Filter>>(O.none)
  const intl = useIntl()

  const filterNames: Partial<Record<Filter, string>> = useMemo(
    () => ({
      base: intl.formatMessage({ id: 'common.asset.base' }),
      ETH: 'erc20',
      BNB: 'bep2'
    }),
    [intl]
  )
  const setActiveFilter = useCallback(
    (oFilter: O.Option<Filter>) => {
      setActiveFilterState(oFilter)
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
        O.getOrElse(() => assets),
        onFilterChanged
      )
    },
    [setActiveFilterState, assets, onFilterChanged]
  )

  // Enable chain filter ONLY in case assets-prop includes at least one asset of this chain
  const availableFilters: O.Option<Filters> = useMemo(
    () =>
      FP.pipe(
        NEA.fromArray(assets),
        O.chain((assets) =>
          NEA.fromArray(
            FP.pipe(
              ENABLED_CHAINS,
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
      ),
    [assets]
  )

  const resetButton = useMemo(
    () =>
      FP.pipe(
        activeFilter,
        O.map(() => (
          <Styled.ResetButton key="reset" onClick={() => setActiveFilter(O.none)}>
            <StopOutlined />
          </Styled.ResetButton>
        )),
        O.toNullable
      ),
    [activeFilter, setActiveFilter]
  )

  const checkIfActive = useCallback(
    (filter: Filter) =>
      FP.pipe(
        activeFilter,
        O.map((active) => active === filter),
        O.toUndefined
      ),
    [activeFilter]
  )

  return FP.pipe(
    availableFilters,
    O.map(
      A.map((filter) => {
        const isActive = checkIfActive(filter)
        return (
          <Styled.FilterButton
            active={isActive ? 'true' : 'false'}
            weight={isActive ? 'bold' : 'normal'}
            onClick={() => setActiveFilter(O.some(filter))}
            key={filter}>
            {filterNames[filter] || filter}
          </Styled.FilterButton>
        )
      })
    ),
    O.map((filters) => (
      <Styled.Container key="container" className={className}>
        {filters}
        {resetButton}
      </Styled.Container>
    )),
    O.toNullable
  )
}

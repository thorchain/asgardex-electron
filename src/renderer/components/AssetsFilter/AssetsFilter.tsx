import React, { useCallback, useMemo, useState } from 'react'

import { StopOutlined } from '@ant-design/icons/lib'
import { Asset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import * as H from './AssetsFilter.helper'
import * as Styled from './AssetsFilter.styles'

type Props = {
  assets?: Asset[]
  onFilterChanged: (filteredAssets: Asset[]) => void
  className?: string
}

export const AssetsFilter: React.FC<Props> = ({ assets = [], onFilterChanged, className }) => {
  const [activeFilter, setActiveFilterState] = useState<O.Option<H.Filter>>(O.none)
  const intl = useIntl()

  const filterNames: Partial<Record<H.Filter, string>> = useMemo(
    () => ({
      base: intl.formatMessage({ id: 'common.asset.base' }),
      USD: 'usd',
      ETH: 'erc20',
      BNB: 'bep2'
    }),
    [intl]
  )
  const setActiveFilter = useCallback(
    (oFilter: O.Option<H.Filter>) => {
      setActiveFilterState(oFilter)
      FP.pipe(oFilter, H.filterAssets(assets), onFilterChanged)
    },
    [setActiveFilterState, assets, onFilterChanged]
  )

  // Enable chain filter ONLY in case assets-prop includes at least one asset of this chain
  const availableFilters: O.Option<H.Filters> = useMemo(() => H.getAvailableChains(assets), [assets])

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
    (filter: H.Filter) =>
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

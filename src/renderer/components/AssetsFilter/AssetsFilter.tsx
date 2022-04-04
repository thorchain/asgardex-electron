import React, { useCallback, useMemo } from 'react'

import { StopOutlined } from '@ant-design/icons/lib'
import { Asset } from '@xchainjs/xchain-util'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { PoolFilter, PoolFilters } from '../../services/midgard/types'
import * as H from './AssetsFilter.helper'
import * as Styled from './AssetsFilter.styles'

type Props = {
  assets?: Asset[]
  className?: string
  activeFilter: O.Option<PoolFilter>
  setFilter: (filter: O.Option<PoolFilter>) => void
}

export const AssetsFilter: React.FC<Props> = ({ assets = [], className, activeFilter, setFilter }) => {
  const intl = useIntl()

  const filterNames: Partial<Record<PoolFilter, string>> = useMemo(
    () => ({
      base: intl.formatMessage({ id: 'common.asset.base' }),
      usd: 'usd',
      ETH: 'erc20',
      BNB: 'bep2'
    }),
    [intl]
  )

  // Enable chain filter ONLY in case assets-prop includes at least one asset of this chain
  const availableFilters: O.Option<PoolFilters> = useMemo(() => H.getAvailableChains(assets), [assets])

  const resetButton = useMemo(
    () =>
      FP.pipe(
        activeFilter,
        O.map(() => (
          <Styled.ResetButton key="reset" onClick={() => setFilter(O.none)}>
            <StopOutlined />
          </Styled.ResetButton>
        )),
        O.toNullable
      ),
    [activeFilter, setFilter]
  )

  const checkIfActive = useCallback(
    (filter: PoolFilter) =>
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
          filterNames[filter] && (
            <Styled.FilterButton
              focused={isActive}
              active={isActive ? 'true' : 'false'}
              weight={isActive ? 'bold' : 'normal'}
              onClick={() => setFilter(O.some(filter))}
              key={filter}>
              {filterNames[filter]}
            </Styled.FilterButton>
          )
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

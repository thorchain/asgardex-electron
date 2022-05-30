import React, { useCallback, useMemo } from 'react'

import { SearchOutlined, StopOutlined } from '@ant-design/icons/lib'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { isStaticPoolFilter, PoolFilter, PoolFilters } from '../../services/midgard/types'
import * as Styled from './AssetsFilter.styles'

type Props = {
  className?: string
  poolFilters: PoolFilters
  activeFilter: O.Option<PoolFilter>
  setFilter: (filter: O.Option<PoolFilter>) => void
}

export const AssetsFilter: React.FC<Props> = ({ poolFilters, className, activeFilter: oActiveFilter, setFilter }) => {
  const intl = useIntl()

  const filterNames: Record<Exclude<PoolFilter, { custom: string }>, string> = useMemo(
    () => ({
      base: intl.formatMessage({ id: 'common.asset.base' }),
      usd: 'usd',
      erc20: 'erc20',
      bep2: 'bep2'
    }),
    [intl]
  )

  const setCustomFilter = useCallback(
    ({ target }: React.ChangeEvent<HTMLInputElement>) => {
      const filter = target.value
      setFilter(filter ? O.some(filter) : O.none)
    },
    [setFilter]
  )

  const inputValue = useMemo(
    () =>
      FP.pipe(
        oActiveFilter,
        O.chain(O.fromPredicate((filter) => !!filter.length && !isStaticPoolFilter(filter))),
        O.getOrElse(() => '')
      ),
    [oActiveFilter]
  )

  return FP.pipe(
    poolFilters,
    A.map((filter) => {
      const isActive = FP.pipe(
        oActiveFilter,
        O.map((active) => active === filter),
        O.toUndefined
      )

      const filterLabel = isStaticPoolFilter(filter) && filterNames[filter]

      return (
        filterLabel && (
          <Styled.FilterButton
            focused={isActive}
            active={isActive ? 'true' : 'false'}
            weight={isActive ? 'bold' : 'normal'}
            onClick={() => setFilter(O.some(filter))}
            key={filter}>
            {filterLabel}
          </Styled.FilterButton>
        )
      )
    }),
    O.fromPredicate((children) => children.length > 0),
    O.map((filters) => (
      <Styled.Container key="container" className={className}>
        <Styled.ButtonContainer>
          {filters}

          <Styled.ResetButton key="reset" onClick={() => setFilter(O.none)} disabled={O.isNone(oActiveFilter)}>
            <StopOutlined />
          </Styled.ResetButton>
        </Styled.ButtonContainer>
        <Styled.Input
          prefix={<SearchOutlined />}
          onChange={setCustomFilter}
          value={inputValue}
          allowClear
          placeholder={intl.formatMessage({ id: 'common.search' }).toUpperCase()}
          size="large"
        />
      </Styled.Container>
    )),
    O.toNullable
  )
}

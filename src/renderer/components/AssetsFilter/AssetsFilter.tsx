import React, { useCallback, useMemo, useState } from 'react'

import { SearchOutlined, StopOutlined } from '@ant-design/icons/lib'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { emptyString } from '../../helpers/stringHelper'
import { isStaticPoolFilter, PoolFilter, PoolFilters, StaticPoolFilter } from '../../services/midgard/types'
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

  const [inputFocused, setInputFocused] = useState(false)
  const [inputValue, setInputValue] = useState(emptyString)

  const setCustomFilter = useCallback(
    ({ target }: React.ChangeEvent<HTMLInputElement>) => {
      const filter = target.value
      setInputValue(filter)
      // Use non-empty strings only
      setFilter(O.fromPredicate((v) => !!v)(filter))
    },
    [setFilter]
  )

  const buttonClickHandler = useCallback(
    (filter: StaticPoolFilter) => {
      setFilter(O.some(filter))
      // empty search input
      setInputValue(emptyString)
    },
    [setFilter]
  )

  return FP.pipe(
    poolFilters,
    A.map((filter) => {
      const isActive = FP.pipe(
        oActiveFilter,
        O.map(
          (active) =>
            active === filter &&
            // don't update if an user has typed something into search field
            !inputFocused &&
            !inputValue
        ),
        O.toUndefined
      )

      const filterLabel = isStaticPoolFilter(filter) && filterNames[filter]

      return (
        filterLabel && (
          <Styled.FilterButton
            focused={isActive}
            active={isActive ? 'true' : 'false'}
            weight={isActive ? 'bold' : 'normal'}
            onClick={() => buttonClickHandler(filter)}
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
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
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

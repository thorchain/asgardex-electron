import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as P from 'fp-ts/Predicate'
import { useIntl } from 'react-intl'

import { emptyString } from '../../helpers/stringHelper'
import { isStaticPoolFilter, PoolFilter, PoolFilters, StaticPoolFilter } from '../../services/midgard/types'
import { InputSearch } from '../uielements/input'
import * as Styled from './AssetsFilter.styles'

type Props = {
  className?: string
  poolFilters: PoolFilters
  activeFilter: O.Option<PoolFilter>
  setFilter: (filter: O.Option<PoolFilter>) => void
}

export const AssetsFilter: React.FC<Props> = ({ poolFilters, className, activeFilter: oActiveFilter, setFilter }) => {
  const intl = useIntl()

  const filterNames: Record<StaticPoolFilter, string> = useMemo(
    () => ({
      __watched__: 'star', // will be replaced by an icon, but don't leave it empty
      __base__: intl.formatMessage({ id: 'common.asset.base' }),
      __usd__: 'usd',
      __erc20__: 'erc20',
      __bep2__: 'bep2',
      __synth__: 'synth'
    }),
    [intl]
  )

  const [inputValue, setInputValue] = useState(emptyString)

  useEffect(() => {
    const filter = FP.pipe(
      oActiveFilter,
      O.chain(O.fromPredicate(P.not(isStaticPoolFilter))),
      O.getOrElse(() => emptyString)
    )
    setInputValue(filter)
  }, [oActiveFilter])

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
      FP.pipe(
        oActiveFilter,
        O.fold(
          () => setFilter(O.some(filter)),
          (activeFilter) => {
            if (filter === activeFilter) setFilter(O.none)
            else setFilter(O.some(filter))
          }
        )
      )
      // empty search input
      setInputValue(emptyString)
    },
    [oActiveFilter, setFilter]
  )

  const clearFilter = useCallback(() => {
    setInputValue(emptyString)
    setFilter(O.none)
  }, [setFilter])

  return FP.pipe(
    poolFilters,
    A.map((filter) => {
      const isActive = FP.pipe(
        oActiveFilter,
        O.map(
          (active) =>
            active === filter &&
            // don't update if an user has typed something into search field
            !inputValue
        ),
        O.getOrElse(() => false)
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
            {filter !== '__watched__' ? filterLabel : <Styled.Star />}
          </Styled.FilterButton>
        )
      )
    }),
    O.fromPredicate((children) => children.length > 0),
    O.map((filters) => (
      <div
        key="container"
        className={`flex w-full flex-col items-center justify-center md:flex-row md:justify-start ${className}`}>
        {filters}
        <InputSearch
          className="mt-10px md:mt-0"
          // Note: `delay-200` needed to handle `onCancel` callback of InputSearch
          // in other case X icon in InputSearch does not fire `onClick` event internally due focus changes + animation of width (tailwind bug?)
          classNameInput="duration-200 delay-200 w-[150px] focus:w-[300px] !bg-gray0 focus:dark:!bg-gray0d focus:!bg-bg0 dark:!bg-bg0d"
          onChange={setCustomFilter}
          value={inputValue}
          size="normal"
          onCancel={clearFilter}
          placeholder={intl.formatMessage({ id: 'common.search' })}
        />
      </div>
    )),
    O.toNullable
  )
}

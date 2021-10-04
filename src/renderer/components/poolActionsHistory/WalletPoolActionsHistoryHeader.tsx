import React from 'react'

import * as Styled from './PoolActionsHistory.styles'
import { PoolActionsHistoryFilter } from './PoolActionsHistoryFilter'
import { Filter } from './types'

export type Props = {
  availableFilters: Filter[]
  currentFilter: Filter
  setFilter: (filter: Filter) => void
  openViewblockUrl: () => Promise<boolean>
  disabled?: boolean
}

export const WalletPoolActionsHistoryHeader: React.FC<Props> = (props) => {
  const { availableFilters, currentFilter, setFilter, openViewblockUrl, disabled = false } = props

  return (
    <>
      <Styled.HeaderFilterContainer>
        <PoolActionsHistoryFilter
          availableFilters={availableFilters}
          currentFilter={currentFilter}
          onFilterChanged={setFilter}
          disabled={disabled}
        />
        {/*
        TODO (@asgdx-team) Will be implemented after #1810
        <SelectAccountAddressComponent />
        */}
      </Styled.HeaderFilterContainer>
      <Styled.HeaderLinkContainer>
        <Styled.Headline onClick={openViewblockUrl}>
          viewblock <Styled.ExplorerLinkIcon />
        </Styled.Headline>
      </Styled.HeaderLinkContainer>
    </>
  )
}

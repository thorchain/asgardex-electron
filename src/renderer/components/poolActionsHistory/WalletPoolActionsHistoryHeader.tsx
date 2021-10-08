import React from 'react'

import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../shared/api/types'
import { WalletAddress, WalletAddresses } from '../../../shared/wallet/types'
import { AccountAddressSelector } from '../AccountAddressSelector'
import * as Styled from './PoolActionsHistory.styles'
import { PoolActionsHistoryFilter } from './PoolActionsHistoryFilter'
import { Filter } from './types'

export type Props = {
  network: Network
  addresses: WalletAddresses
  selectedAddress: O.Option<WalletAddress>
  availableFilters: Filter[]
  currentFilter: Filter
  setFilter: (filter: Filter) => void
  onWalletAddressChanged: (address: WalletAddress) => void
  openViewblockUrl: () => Promise<boolean>
  disabled?: boolean
}

export const WalletPoolActionsHistoryHeader: React.FC<Props> = (props) => {
  const {
    network,
    addresses,
    selectedAddress,
    availableFilters,
    currentFilter,
    setFilter,
    openViewblockUrl,
    onWalletAddressChanged,
    disabled = false
  } = props

  return (
    <>
      <Styled.HeaderFilterContainer>
        <PoolActionsHistoryFilter
          availableFilters={availableFilters}
          currentFilter={currentFilter}
          onFilterChanged={setFilter}
          disabled={disabled}
        />
        <AccountAddressSelector
          addresses={addresses}
          network={network}
          selectedAddress={selectedAddress}
          onChangeAddress={onWalletAddressChanged}
        />
      </Styled.HeaderFilterContainer>
      <Styled.HeaderLinkContainer>
        <Styled.Headline onClick={openViewblockUrl}>
          viewblock <Styled.ExplorerLinkIcon />
        </Styled.Headline>
      </Styled.HeaderLinkContainer>
    </>
  )
}

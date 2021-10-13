import React from 'react'

import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../../shared/api/types'
import { WalletAddress, WalletAddresses } from '../../../shared/wallet/types'
import { AccountAddressSelector } from '../AccountAddressSelector'
import { PoolActionsHistoryFilter } from './PoolActionsHistoryFilter'
import { Filter } from './types'
import * as Styled from './WalletPoolActionsHistoryHeader.styles'

export type Props = {
  network: Network
  addresses: WalletAddresses
  selectedAddress: O.Option<WalletAddress>
  availableFilters: Filter[]
  currentFilter: Filter
  setFilter: (filter: Filter) => void
  onWalletAddressChanged: (address: WalletAddress) => void
  onClickAddressIcon: FP.Lazy<void>
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
    onClickAddressIcon,
    onWalletAddressChanged,
    disabled = false
  } = props

  return (
    <>
      <Styled.FilterContainer>
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
      </Styled.FilterContainer>
      <Styled.LinkContainer>
        <Styled.Headline onClick={onClickAddressIcon}>
          viewblock <Styled.ExplorerLinkIcon />
        </Styled.Headline>
      </Styled.LinkContainer>
    </>
  )
}

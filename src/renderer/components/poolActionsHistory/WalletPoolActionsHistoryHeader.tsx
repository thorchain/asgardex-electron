import React from 'react'
// TODO (@asgdx-team) Will be removed after #1810
// import { BCHChain, BNBChain, BTCChain, ETHChain, LTCChain, THORChain } from '@xchainjs/xchain-util'

import { Network } from '../../../shared/api/types'
// TODO (@asgdx-team) Will be implemented after #1810
// import { AccountAddressSelector, WalletAddress } from '../AccountAddressSelector'
import * as Styled from './PoolActionsHistory.styles'
import { PoolActionsHistoryFilter } from './PoolActionsHistoryFilter'
import { Filter } from './types'

// // TODO (@asgdx-team) Will be removed after #1810
// const addresses: WalletAddress[] = [
//   {
//     walletAddress: 'tbnb1ed04qgw3s69z90jskr3shpyn9mr0e59qdtsxqa',
//     walletType: 'ledger',
//     chain: BNBChain
//   },
//   {
//     walletAddress: 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg',
//     walletType: 'ledger',
//     chain: THORChain
//   },
//   {
//     walletAddress: '0x33292c1d02c432d323fb62c57fb327da45e1bdde',
//     walletType: 'keystore',
//     chain: ETHChain
//   },
//   {
//     walletAddress: 'tb1qtephp596jhpwrawlp67junuk347zl2cwc56xml',
//     walletType: 'keystore',
//     chain: BTCChain
//   },
//   {
//     walletAddress: 'qr20g55jd7x3dalp4qxjfgfvda0nwr8cfccrgxd0dw',
//     walletType: 'keystore',
//     chain: BCHChain
//   },
//   {
//     walletAddress: 'tltc1qtephp596jhpwrawlp67junuk347zl2cwpucctk',
//     walletType: 'keystore',
//     chain: LTCChain
//   }
// ]

export type Props = {
  network: Network
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
        <AccountAddressSelector addresses={addresses} network={network} selectedAddress={addresses[0]} />
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

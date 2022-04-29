import React, { useEffect, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'

import { Network } from '../../../shared/api/types'
import { OpenExplorerTxUrl } from '../../services/clients'
import { ActionsPage, ActionsPageRD } from '../../services/midgard/types'
import * as Styled from './PoolActionsHistory.styles'
import { PoolActionsHistoryList } from './PoolActionsHistoryList'
import { PoolActionsHistoryTable, Props as PoolActionsHistoryTableProps } from './PoolActionsHistoryTable'

type Props = {
  network: Network
  headerContent?: React.ReactNode
  currentPage: number
  historyPageRD: ActionsPageRD
  prevHistoryPage?: O.Option<ActionsPage>
  openExplorerTxUrl: OpenExplorerTxUrl
  changePaginationHandler: (page: number) => void
  reloadHistory: FP.Lazy<void>
  className?: string
}

export const PoolActionsHistory: React.FC<Props> = (props) => {
  const {
    network,
    headerContent: HeaderContent,
    historyPageRD,
    currentPage,
    prevHistoryPage,
    changePaginationHandler,
    openExplorerTxUrl,
    reloadHistory
  } = props
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  // store previous data of Txs to render these while reloading
  const prevHistoryPageRef = useRef<O.Option<ActionsPage>>(O.none)

  useEffect(() => {
    FP.pipe(
      historyPageRD,
      RD.map((data) => {
        prevHistoryPageRef.current = O.some(data)
        return true
      })
    )
  }, [historyPageRD])

  const tableProps: PoolActionsHistoryTableProps = {
    currentPage,
    historyPageRD,
    prevHistoryPage,
    openExplorerTxUrl,
    changePaginationHandler,
    network,
    reloadHistory
  }

  return (
    <>
      {HeaderContent && <Styled.Header>{HeaderContent}</Styled.Header>}
      {isDesktopView ? (
        <PoolActionsHistoryTable prevHistoryPage={prevHistoryPageRef.current} {...tableProps} />
      ) : (
        <PoolActionsHistoryList prevHistoryPage={prevHistoryPageRef.current} {...tableProps} />
      )}
    </>
  )
}

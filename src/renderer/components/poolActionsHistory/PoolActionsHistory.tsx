import React, { useEffect, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/Option'

import { OpenExplorerTxUrl } from '../../services/clients'
import { PoolActionsHistoryPage, PoolActionsHistoryPageRD } from '../../services/midgard/types'
import * as Styled from './PoolActionsHistory.styles'
import { PoolActionsHistoryList } from './PoolActionsHistoryList'
import { PoolActionsHistoryTable, Props as PoolActionsHistoryTableProps } from './PoolActionsHistoryTable'

type Props = {
  headerContent?: React.ReactNode
  currentPage: number
  actionsPageRD: PoolActionsHistoryPageRD
  prevActionsPage?: O.Option<PoolActionsHistoryPage>
  openExplorerTxUrl: OpenExplorerTxUrl
  changePaginationHandler: (page: number) => void
  className?: string
}

export const PoolActionsHistory: React.FC<Props> = (props) => {
  const {
    headerContent: HeaderContent,
    actionsPageRD,
    currentPage,
    prevActionsPage,
    changePaginationHandler,
    openExplorerTxUrl
  } = props
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  // store previous data of Txs to render these while reloading
  const previousTxs = useRef<O.Option<PoolActionsHistoryPage>>(O.none)

  useEffect(() => {
    FP.pipe(
      actionsPageRD,
      RD.map((data) => {
        previousTxs.current = O.some(data)
        return true
      })
    )
  }, [actionsPageRD])

  const tableProps: PoolActionsHistoryTableProps = {
    currentPage,
    actionsPageRD,
    prevActionsPage,
    openExplorerTxUrl,
    changePaginationHandler
  }

  return (
    <>
      {HeaderContent && <Styled.Header>{HeaderContent}</Styled.Header>}
      {isDesktopView ? (
        <PoolActionsHistoryTable prevActionsPage={previousTxs.current} {...tableProps} />
      ) : (
        <PoolActionsHistoryList prevActionsPage={previousTxs.current} {...tableProps} />
      )}
    </>
  )
}

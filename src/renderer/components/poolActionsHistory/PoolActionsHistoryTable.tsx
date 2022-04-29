import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Grid } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { OpenExplorerTxUrl } from '../../services/clients'
import { ActionsPage, Action, ActionsPageRD } from '../../services/midgard/types'
import { ApiError } from '../../services/wallet/types'
import { ErrorView } from '../shared/error'
import { Button } from '../uielements/button'
import * as CommonStyled from '../uielements/common/Common.styles'
import { Pagination } from '../uielements/pagination'
import { TxDetail } from '../uielements/txDetail'
import { DEFAULT_PAGE_SIZE } from './PoolActionsHistory.const'
import * as H from './PoolActionsHistory.helper'
import * as Styled from './PoolActionsHistoryTable.styles'

export type Props = {
  network: Network
  currentPage: number
  historyPageRD: ActionsPageRD
  prevHistoryPage?: O.Option<ActionsPage>
  openExplorerTxUrl: OpenExplorerTxUrl
  changePaginationHandler: (page: number) => void
  reloadHistory: FP.Lazy<void>
  className?: string
}

export const PoolActionsHistoryTable: React.FC<Props> = ({
  network,
  openExplorerTxUrl,
  changePaginationHandler,
  historyPageRD,
  prevHistoryPage = O.none,
  reloadHistory,
  currentPage
}) => {
  const intl = useIntl()

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const actionTypeColumn: ColumnType<Action> = useMemo(
    () => ({
      key: 'txType',
      align: 'left',
      width: 180,
      render: (_, { type }: Action) => <Styled.TxType type={type} showTypeIcon={isDesktopView} />
    }),
    [isDesktopView]
  )

  const renderDateColumn = useCallback((_, { date }: Action) => H.renderDate(date), [])

  const dateColumn: ColumnType<Action> = useMemo(
    () => ({
      key: 'timeStamp',
      align: 'center',
      width: 150,
      render: renderDateColumn
    }),
    [renderDateColumn]
  )

  const renderLinkColumn = useCallback(
    (action: Action) =>
      FP.pipe(
        action,
        H.getTxId,
        O.map((txID) => <CommonStyled.ExternalLinkIcon key="external link" onClick={() => openExplorerTxUrl(txID)} />),
        O.getOrElse(() => <></>)
      ),
    [openExplorerTxUrl]
  )

  const linkColumn: ColumnType<Action> = useMemo(
    () => ({
      key: 'txHash',
      title: intl.formatMessage({ id: 'common.detail' }),
      align: 'center',
      width: 60,
      render: renderLinkColumn
    }),
    [renderLinkColumn, intl]
  )

  const renderDetailColumn = useCallback(
    (action: Action) => (
      <TxDetail
        type={action.type}
        date={H.renderDate(action.date)}
        incomes={H.getValues(action.in)}
        outgos={H.getValues(action.out)}
        fees={action.fees}
        slip={action.slip}
        network={network}
        isDesktopView={isDesktopView}
      />
    ),
    [isDesktopView, network]
  )

  const detailColumn: ColumnType<Action> = useMemo(
    () => ({
      key: 'txDetail',
      align: 'left',
      render: renderDetailColumn
    }),
    [renderDetailColumn]
  )

  const columns: ColumnsType<Action> = useMemo(
    () => [actionTypeColumn, detailColumn, dateColumn, linkColumn],
    [actionTypeColumn, detailColumn, dateColumn, linkColumn]
  )

  const renderTable = useCallback(
    ({ total, actions }: ActionsPage, loading = false) => {
      return (
        <>
          <Styled.Table
            columns={columns}
            dataSource={actions}
            loading={loading}
            rowKey={H.getRowKey}
            showHeader={false}
          />
          {total > 0 && (
            <Pagination
              current={currentPage}
              total={total}
              defaultPageSize={DEFAULT_PAGE_SIZE}
              showSizeChanger={false}
              onChange={changePaginationHandler}
            />
          )}
        </>
      )
    },
    [columns, changePaginationHandler, currentPage]
  )

  return useMemo(
    () => (
      <>
        {FP.pipe(
          historyPageRD,
          RD.fold(
            () => renderTable(H.emptyData, true),
            () => {
              const data = FP.pipe(
                prevHistoryPage,
                O.getOrElse(() => H.emptyData)
              )
              return renderTable(data, true)
            },
            ({ msg }: ApiError) => (
              <ErrorView
                title={intl.formatMessage({ id: 'common.error' })}
                subTitle={msg}
                extra={<Button onClick={reloadHistory}>{intl.formatMessage({ id: 'common.retry' })}</Button>}
              />
            ),
            renderTable
          )
        )}
      </>
    ),
    [renderTable, historyPageRD, prevHistoryPage, intl, reloadHistory]
  )
}

import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { OpenExplorerTxUrl } from '../../services/clients'
import { PoolActionsHistoryPage, PoolAction, PoolActionsHistoryPageRD } from '../../services/midgard/types'
import { ApiError } from '../../services/wallet/types'
import { ErrorView } from '../shared/error'
import * as CommonStyled from '../uielements/common/Common.styles'
import { Pagination } from '../uielements/pagination'
import { TxDetail } from '../uielements/txDetail'
import { DEFAULT_PAGE_SIZE } from './PoolActionsHistory.const'
import * as H from './PoolActionsHistory.helper'
import * as Styled from './PoolActionsHistoryTable.styles'

export type Props = {
  currentPage: number
  actionsPageRD: PoolActionsHistoryPageRD
  prevActionsPage?: O.Option<PoolActionsHistoryPage>
  openExplorerTxUrl: OpenExplorerTxUrl
  changePaginationHandler: (page: number) => void
  className?: string
}

export const PoolActionsHistoryTable: React.FC<Props> = ({
  openExplorerTxUrl,
  changePaginationHandler,
  actionsPageRD,
  prevActionsPage = O.none,
  currentPage
}) => {
  const intl = useIntl()

  const renderActionTypeColumn = useCallback((_, { type }: PoolAction) => <Styled.TxType type={type} />, [])

  const actionTypeColumn: ColumnType<PoolAction> = useMemo(
    () => ({
      key: 'txType',
      align: 'left',
      width: 180,
      render: renderActionTypeColumn
    }),
    [renderActionTypeColumn]
  )

  const renderDateColumn = useCallback((_, { date }: PoolAction) => H.renderDate(date), [])

  const dateColumn: ColumnType<PoolAction> = useMemo(
    () => ({
      key: 'timeStamp',
      align: 'center',
      width: 150,
      render: renderDateColumn
    }),
    [renderDateColumn]
  )

  const renderLinkColumn = useCallback(
    (action: PoolAction) =>
      FP.pipe(
        action,
        H.getTxId,
        O.map((txID) => <CommonStyled.ExternalLinkIcon key="external link" onClick={() => openExplorerTxUrl(txID)} />),
        O.getOrElse(() => <></>)
      ),
    [openExplorerTxUrl]
  )

  const linkColumn: ColumnType<PoolAction> = useMemo(
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
    (action: PoolAction) => (
      <TxDetail
        type={action.type}
        date={H.renderDate(action.date)}
        incomes={H.getValues(action.in)}
        outgos={H.getValues(action.out)}
        fees={action.fees}
        slip={action.slip}
      />
    ),
    []
  )

  const detailColumn: ColumnType<PoolAction> = useMemo(
    () => ({
      key: 'txDetail',
      align: 'left',
      render: renderDetailColumn
    }),
    [renderDetailColumn]
  )

  const columns: ColumnsType<PoolAction> = useMemo(
    () => [actionTypeColumn, detailColumn, dateColumn, linkColumn],
    [actionTypeColumn, detailColumn, dateColumn, linkColumn]
  )

  const renderTable = useCallback(
    ({ total, actions }: PoolActionsHistoryPage, loading = false) => {
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
        {RD.fold(
          () => renderTable(H.emptyData, true),
          () => {
            const data = FP.pipe(
              prevActionsPage,
              O.getOrElse(() => H.emptyData)
            )
            return renderTable(data, true)
          },
          ({ msg }: ApiError) => <ErrorView title={msg} />,
          renderTable
        )(actionsPageRD)}
      </>
    ),
    [actionsPageRD, renderTable, prevActionsPage]
  )
}

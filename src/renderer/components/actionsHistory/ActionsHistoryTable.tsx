import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as A from 'fp-ts/Array'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { MAX_ITEMS_PER_PAGE } from '../../services/const'
import { HistoryActionsPage, HistoryAction } from '../../services/midgard/types'
import { ApiError } from '../../services/wallet/types'
import { ErrorView } from '../shared/error'
import * as CommonStyled from '../uielements/common/Common.style'
import { Pagination } from '../uielements/pagination'
import { ReloadButton } from '../uielements/reloadButton'
import { TxDetail } from '../uielements/txDetail'
import * as H from './ActionsHistory.helper'
import * as Styled from './ActionsHistoryTable.styles'
import { Props } from './types'

export const ActionsHistoryTable: React.FC<Props> = ({
  clickTxLinkHandler,
  changePaginationHandler,
  actionsPageRD,
  prevActionsPage = O.none,
  currentPage,
  currentFilter,
  setFilter,
  reload
}) => {
  const intl = useIntl()

  const renderActionTypeColumn = useCallback((_, { type }: HistoryAction) => <Styled.TxType type={type} />, [])

  const actionTypeColumn: ColumnType<HistoryAction> = useMemo(
    () => ({
      key: 'txType',
      title: <Styled.ActionsFilter currentFilter={currentFilter} onFilterChanged={setFilter} />,
      align: 'left',
      width: 180,
      render: renderActionTypeColumn
    }),
    [renderActionTypeColumn, setFilter, currentFilter]
  )

  const renderDateColumn = useCallback((_, { date }: HistoryAction) => H.renderDate(date), [])

  const dateColumn: ColumnType<HistoryAction> = useMemo(
    () => ({
      key: 'timeStamp',
      title: intl.formatMessage({ id: 'common.date' }),
      align: 'center',
      width: 150,
      render: renderDateColumn
    }),
    [intl, renderDateColumn]
  )

  const renderLinkColumn = useCallback(
    (action: HistoryAction) =>
      FP.pipe(
        action.in,
        A.head,
        O.alt(() => A.head(action.out)),
        O.map(({ txID }) => (
          <CommonStyled.ExternalLinkIcon key="external link" onClick={() => clickTxLinkHandler(txID)} />
        )),
        O.getOrElse(() => <></>)
      ),
    [clickTxLinkHandler]
  )

  const linkColumn: ColumnType<HistoryAction> = useMemo(
    () => ({
      key: 'txHash',
      title: <ReloadButton onClick={reload} />,
      align: 'center',
      width: 60,
      render: renderLinkColumn
    }),
    [renderLinkColumn, reload]
  )

  const renderDetailColumn = useCallback(
    (action: HistoryAction) => (
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

  const detailColumn: ColumnType<HistoryAction> = useMemo(
    () => ({
      key: 'txDetail',
      title: intl.formatMessage({ id: 'common.detail' }),
      align: 'left',
      render: renderDetailColumn
    }),
    [renderDetailColumn, intl]
  )

  const columns: ColumnsType<HistoryAction> = useMemo(() => [actionTypeColumn, detailColumn, dateColumn, linkColumn], [
    actionTypeColumn,
    detailColumn,
    dateColumn,
    linkColumn
  ])

  const renderTable = useCallback(
    ({ total, actions }: HistoryActionsPage, loading = false) => {
      return (
        <>
          <Styled.Table columns={columns} dataSource={actions} loading={loading} rowKey="txHash" />
          {total > 0 && (
            <Pagination
              current={currentPage}
              total={total}
              defaultPageSize={MAX_ITEMS_PER_PAGE}
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

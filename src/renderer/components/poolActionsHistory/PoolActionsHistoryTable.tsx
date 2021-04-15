import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { PoolActionsHistoryPage, PoolAction } from '../../services/midgard/types'
import { ApiError } from '../../services/wallet/types'
import { ErrorView } from '../shared/error'
import * as CommonStyled from '../uielements/common/Common.style'
import { Pagination } from '../uielements/pagination'
import { TxDetail } from '../uielements/txDetail'
import { DEFAULT_PAGE_SIZE } from './PoolActionsHistory.const'
import * as H from './PoolActionsHistory.helper'
import * as Styled from './PoolActionsHistoryTable.styles'
import { Props } from './types'

export const PoolActionsHistoryTable: React.FC<Props> = ({
  goToTx,
  changePaginationHandler,
  actionsPageRD,
  prevActionsPage = O.none,
  currentPage,
  currentFilter,
  setFilter,
  availableFilters
}) => {
  const intl = useIntl()

  const renderActionTypeColumn = useCallback((_, { type }: PoolAction) => <Styled.TxType type={type} />, [])

  const actionTypeColumn: ColumnType<PoolAction> = useMemo(
    () => ({
      key: 'txType',
      title: (
        <Styled.ActionsFilter
          availableFilters={availableFilters}
          currentFilter={currentFilter}
          onFilterChanged={setFilter}
        />
      ),
      align: 'left',
      width: 180,
      render: renderActionTypeColumn
    }),
    [renderActionTypeColumn, setFilter, currentFilter, availableFilters]
  )

  const renderDateColumn = useCallback((_, { date }: PoolAction) => H.renderDate(date), [])

  const dateColumn: ColumnType<PoolAction> = useMemo(
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
    (action: PoolAction) =>
      FP.pipe(
        action,
        H.getTxId,
        O.map((txID) => <CommonStyled.ExternalLinkIcon key="external link" onClick={() => goToTx(txID)} />),
        O.getOrElse(() => <></>)
      ),
    [goToTx]
  )

  const linkColumn: ColumnType<PoolAction> = useMemo(
    () => ({
      key: 'txHash',
      title: intl.formatMessage({ id: 'common.detail' }),
      align: 'center',
      width: 120,
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
      title: intl.formatMessage({ id: 'common.detail' }),
      align: 'left',
      render: renderDetailColumn
    }),
    [renderDetailColumn, intl]
  )

  const columns: ColumnsType<PoolAction> = useMemo(() => [actionTypeColumn, detailColumn, dateColumn, linkColumn], [
    actionTypeColumn,
    detailColumn,
    dateColumn,
    linkColumn
  ])

  const renderTable = useCallback(
    ({ total, actions }: PoolActionsHistoryPage, loading = false) => {
      return (
        <>
          <Styled.Table columns={columns} dataSource={actions} loading={loading} rowKey={H.getRowKey} />
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

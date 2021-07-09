import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { PoolAction, PoolActionsHistoryPage } from '../../services/midgard/types'
import { ErrorView } from '../shared/error'
import { Pagination } from '../uielements/pagination'
import { TxDetail } from '../uielements/txDetail'
import { DEFAULT_PAGE_SIZE } from './PoolActionsHistory.const'
import * as H from './PoolActionsHistory.helper'
import * as Styled from './PoolActionsHistoryList.styles'
import { Props } from './types'

const renderItem = (goToTx: (txId: string) => void) => (action: PoolAction) => {
  const date = H.renderDate(action.date)

  const titleExtra = (
    <>
      {date}
      {FP.pipe(
        action,
        H.getTxId,
        O.map((id) => (
          <Styled.GoToButton key="go" onClick={() => goToTx(id)}>
            <Styled.InfoArrow />
          </Styled.GoToButton>
        )),
        O.getOrElse(() => <></>)
      )}
    </>
  )

  return (
    <Styled.ListItem key={H.getRowKey(action)}>
      <Styled.Card title={<Styled.TxType type={action.type} />} extra={titleExtra}>
        <TxDetail type={action.type} date={date} incomes={H.getValues(action.in)} outgos={H.getValues(action.out)} />
      </Styled.Card>
    </Styled.ListItem>
  )
}

export const PoolActionsHistoryList: React.FC<Props> = ({
  changePaginationHandler,
  actionsPageRD,
  prevActionsPage = O.none,
  openExplorerTxUrl: goToTx,
  currentPage,
  currentFilter,
  setFilter,
  className,
  availableFilters
}) => {
  const renderListItem = useMemo(() => renderItem(goToTx), [goToTx])
  const renderList = useCallback(
    ({ total, actions }: PoolActionsHistoryPage, loading = false) => {
      return (
        <>
          <Styled.List loading={loading} itemLayout="vertical" dataSource={actions} renderItem={renderListItem} />
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
    [changePaginationHandler, renderListItem, currentPage]
  )

  return (
    <div className={className}>
      <Styled.ActionsFilter
        availableFilters={availableFilters}
        currentFilter={currentFilter}
        onFilterChanged={setFilter}
        disabled={!RD.isSuccess(actionsPageRD)}
      />
      {FP.pipe(
        actionsPageRD,
        RD.fold(
          () => renderList(H.emptyData, true),
          () => {
            const data = FP.pipe(
              prevActionsPage,
              O.getOrElse(() => H.emptyData)
            )
            return renderList(data, true)
          },
          ({ msg }) => <ErrorView key="error view" title={msg} />,
          renderList
        )
      )}
    </div>
  )
}

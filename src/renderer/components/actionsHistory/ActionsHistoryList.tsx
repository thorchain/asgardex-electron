import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'

import { MAX_ITEMS_PER_PAGE } from '../../services/const'
import { HistoryAction, HistoryActionsPage } from '../../services/midgard/types'
import { ErrorView } from '../shared/error'
import { Pagination } from '../uielements/pagination'
import { TxDetail } from '../uielements/txDetail'
import * as H from './ActionsHistory.helper'
import * as Styled from './ActionsHistoryList.styles'
import { Props } from './types'

const renderItem = (goToTx: (txId: string) => void) => (action: HistoryAction) => {
  const date = H.renderDate(action.date)

  const oTxId = H.getTxId(action)

  const titleExtra = (
    <>
      {date}
      {FP.pipe(
        oTxId,
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
    <Styled.ListItem key={action.type + action.date.toTimeString()}>
      <Styled.Card title={<Styled.TxType type={action.type} />} extra={titleExtra}>
        <TxDetail type={action.type} date={date} incomes={H.getValues(action.in)} outgos={H.getValues(action.out)} />
      </Styled.Card>
    </Styled.ListItem>
  )
}

export const ActionsHistoryList: React.FC<Props> = ({
  changePaginationHandler,
  actionsPageRD,
  prevActionsPageRD = O.none,
  goToTx,
  currentPage,
  currentFilter,
  setFilter
}) => {
  const renderListItem = useMemo(() => renderItem(goToTx), [goToTx])
  const renderList = useCallback(
    ({ total, actions }: HistoryActionsPage, loading = false) => {
      return (
        <>
          <Styled.List loading={loading} itemLayout="vertical" dataSource={actions} renderItem={renderListItem} />
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
    [changePaginationHandler, renderListItem, currentPage]
  )

  const showFilter: boolean = useMemo(() => O.isSome(prevActionsPageRD) && RD.isSuccess(actionsPageRD), [
    actionsPageRD,
    prevActionsPageRD
  ])

  return (
    <Styled.Container>
      {showFilter && <Styled.ActionsFilter currentFilter={currentFilter} onFilterChanged={setFilter} />}
      {FP.pipe(
        actionsPageRD,
        RD.fold(
          () => renderList(H.emptyData, true),
          () => {
            const data = FP.pipe(
              prevActionsPageRD,
              O.getOrElse(() => H.emptyData)
            )
            return renderList(data, true)
          },
          ({ msg }) => <ErrorView key="error view" title={msg} />,
          renderList
        )
      )}
    </Styled.Container>
  )
}

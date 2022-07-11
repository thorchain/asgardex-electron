import React, { useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Grid } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../shared/api/types'
import { OpenExplorerTxUrl } from '../../services/clients'
import { Action, ActionsPage, ActionsPageRD } from '../../services/midgard/types'
import { ErrorView } from '../shared/error'
import { Button } from '../uielements/button'
import { Pagination } from '../uielements/pagination'
import { TxDetail } from '../uielements/txDetail'
import { DEFAULT_PAGE_SIZE } from './PoolActionsHistory.const'
import * as H from './PoolActionsHistory.helper'
import * as Styled from './PoolActionsHistoryList.styles'

type Props = {
  network: Network
  currentPage: number
  historyPageRD: ActionsPageRD
  prevHistoryPage?: O.Option<ActionsPage>
  openExplorerTxUrl: OpenExplorerTxUrl
  changePaginationHandler: (page: number) => void
  reloadHistory: FP.Lazy<void>
  className?: string
}

export const PoolActionsHistoryList: React.FC<Props> = ({
  network,
  changePaginationHandler,
  historyPageRD,
  prevHistoryPage = O.none,
  openExplorerTxUrl: goToTx,
  currentPage,
  reloadHistory,
  className
}) => {
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const intl = useIntl()

  const renderListItem = useCallback(
    (action: Action, index: number, goToTx: OpenExplorerTxUrl) => {
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
        <Styled.ListItem key={H.getRowKey(action, index)}>
          <Styled.Card title={<Styled.TxType type={action.type} showTypeIcon={isDesktopView} />} extra={titleExtra}>
            <TxDetail
              type={action.type}
              date={date}
              incomes={H.getValues(action.in)}
              outgos={H.getValues(action.out)}
              network={network}
              isDesktopView={isDesktopView}
            />
          </Styled.Card>
        </Styled.ListItem>
      )
    },
    [isDesktopView, network]
  )

  const renderList = useCallback(
    ({ total, actions }: ActionsPage, loading = false) => {
      return (
        <>
          <Styled.List
            loading={loading}
            itemLayout="vertical"
            dataSource={actions}
            renderItem={(action, index) => renderListItem(action, index, goToTx)}
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
    [currentPage, changePaginationHandler, renderListItem, goToTx]
  )

  return (
    <div className={className}>
      {FP.pipe(
        historyPageRD,
        RD.fold(
          () => renderList(H.emptyData, true),
          () => {
            const data = FP.pipe(
              prevHistoryPage,
              O.getOrElse(() => H.emptyData)
            )
            return renderList(data, true)
          },
          ({ msg }) => (
            <ErrorView
              title={intl.formatMessage({ id: 'common.error' })}
              subTitle={msg}
              extra={<Button onClick={reloadHistory}>{intl.formatMessage({ id: 'common.retry' })}</Button>}
            />
          ),
          renderList
        )
      )}
    </div>
  )
}

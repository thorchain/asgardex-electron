import React, { useCallback, useState } from 'react'

import { Row, Col, Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { TxsRD, LoadTxsProps } from '../../../../services/binance/types'
import { MAX_PAGINATION_ITEMS } from '../../../../services/const'
import * as Styled from './TxsHistory.style'
import TxsHistoryTableBNB from './TxsHistoryTableBNB'

type Props = {
  txsRD: TxsRD
  explorerUrl?: O.Option<string>
  reloadTxsHistoryHandler?: (_: LoadTxsProps) => void
}

const TxsHistoryBNB: React.FC<Props> = (props): JSX.Element => {
  const { txsRD, reloadTxsHistoryHandler: reloadTxsHandler = (_: LoadTxsProps) => {}, explorerUrl = O.none } = props

  const [currentPage, setCurrentPage] = useState(1)

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false
  const intl = useIntl()

  const _refreshHandler = useCallback(() => {
    reloadTxsHandler({ limit: MAX_PAGINATION_ITEMS, offset: (currentPage - 1) * MAX_PAGINATION_ITEMS })
  }, [currentPage, reloadTxsHandler])

  const clickTxLinkHandler = useCallback(
    (txHash: string) => {
      FP.pipe(
        explorerUrl,
        O.map((url) => window.apiUrl.openExternal(`${url}/tx/${txHash}`))
      )
    },
    [explorerUrl]
  )

  const onChangePagination = useCallback(
    (pageNo) => {
      reloadTxsHandler({ limit: MAX_PAGINATION_ITEMS, offset: (pageNo - 1) * MAX_PAGINATION_ITEMS })
      setCurrentPage(pageNo)
    },
    [reloadTxsHandler]
  )

  return (
    <Row>
      <Col span={24}>
        <Styled.TableHeadline isDesktop={isDesktopView}>
          {intl.formatMessage({ id: 'wallet.txs.last90days' })}
        </Styled.TableHeadline>
      </Col>
      <Col span={24}>
        <TxsHistoryTableBNB
          txsRD={txsRD}
          clickTxLinkHandler={clickTxLinkHandler}
          changePaginationHandler={onChangePagination}
        />
      </Col>
    </Row>
  )
}
export default TxsHistoryBNB

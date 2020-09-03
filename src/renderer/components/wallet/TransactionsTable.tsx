import React, { useMemo, useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Txs, Tx, Address, TxPage } from '@thorchain/asgardex-binance'
import { assetAmount, bnOrZero, formatAssetAmount } from '@thorchain/asgardex-util'
import { Grid, Col, Row } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl, FormattedDate, FormattedTime } from 'react-intl'

import { TxsRD } from '../../services/binance/types'
import { MAX_PAGINATION_ITEMS } from '../../services/const'
import ErrorView from '../shared/error/ErrorView'
import Pagination from '../uielements/Pagination'
import * as Styled from './TransactionTable.style'

type Props = {
  txsRD: TxsRD
  address: O.Option<Address>
  clickTxLinkHandler: (txHash: string) => void
  changePaginationHandler: (page: number) => void
}
const TransactionsTable: React.FC<Props> = (props: Props): JSX.Element => {
  const { txsRD, clickTxLinkHandler, changePaginationHandler } = props
  const intl = useIntl()
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // store previous data of Txs to render these while reloading
  const previousTxs = useRef<O.Option<TxPage>>(O.none)

  const renderTypeColumn = useCallback(({ txType }: Tx) => {
    if (txType === 'FREEZE_TOKEN') return <Styled.FreezeIcon />
    if (txType === 'UN_FREEZE_TOKEN') return <Styled.UnfreezeIcon />
    if (txType === 'TRANSFER') return <Styled.TransferIcon />
    return <></>
  }, [])
  const typeColumn: ColumnType<Tx> = {
    key: 'txType',
    title: '',
    align: 'center',
    width: 60,
    render: renderTypeColumn,
    sortDirections: ['descend', 'ascend']
  }

  const renderFromColumn = useCallback(({ fromAddr }: Tx) => <Styled.Text>{fromAddr}</Styled.Text>, [])
  const fromColumn: ColumnType<Tx> = {
    key: 'fromAddr',
    title: intl.formatMessage({ id: 'common.from' }),
    align: 'left',
    ellipsis: true,
    render: renderFromColumn,
    sorter: (a: Tx, b: Tx) => a.fromAddr.localeCompare(b.fromAddr),
    sortDirections: ['descend', 'ascend']
  }

  const renderToColumn = useCallback(({ toAddr }: Tx) => <Styled.Text>{toAddr}</Styled.Text>, [])
  const toColumn: ColumnType<Tx> = {
    key: 'toAddr',
    title: intl.formatMessage({ id: 'common.to' }),
    align: 'left',
    ellipsis: true,
    render: renderToColumn,
    sorter: (a: Tx, b: Tx) => a.toAddr.localeCompare(b.toAddr),
    sortDirections: ['descend', 'ascend']
  }

  const renderDateColumn = useCallback(
    ({ timeStamp }: Tx) => {
      const date = new Date(timeStamp)
      return (
        <Row gutter={[8, 0]}>
          <Col>
            <Styled.Text>
              <FormattedDate
                year={isDesktopView ? 'numeric' : '2-digit'}
                month={isDesktopView ? '2-digit' : 'numeric'}
                day={isDesktopView ? '2-digit' : 'numeric'}
                value={date}
              />
            </Styled.Text>
          </Col>
          <Col>
            <Styled.Text>
              <FormattedTime hour="2-digit" minute="2-digit" second="2-digit" hour12={false} value={date} />
            </Styled.Text>
          </Col>
        </Row>
      )
    },
    [isDesktopView]
  )

  const dateColumn: ColumnType<Tx> = {
    key: 'timeStamp',
    title: intl.formatMessage({ id: 'common.date' }),
    align: 'left',
    width: isDesktopView ? 200 : 180,
    render: renderDateColumn,
    sorter: (a: Tx, b: Tx) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime(),
    sortDirections: ['descend', 'ascend'],
    defaultSortOrder: 'descend'
  }

  const renderAmountColumn = useCallback(({ value }: Tx) => {
    const amount = assetAmount(bnOrZero(value))
    const label = formatAssetAmount(amount, 8)
    return <Styled.Text>{label}</Styled.Text>
  }, [])

  const amountColumn: ColumnType<Tx> = {
    key: 'value',
    title: intl.formatMessage({ id: 'common.amount' }),
    align: 'left',
    render: renderAmountColumn,
    sorter: (a: Tx, b: Tx) => bnOrZero(a.value).comparedTo(bnOrZero(b.value)),
    sortDirections: ['descend', 'ascend']
  }

  const renderLinkColumn = useCallback(
    ({ txHash }: Tx) => <Styled.LinkIcon onClick={() => clickTxLinkHandler(txHash)} />,
    [clickTxLinkHandler]
  )
  const linkColumn: ColumnType<Tx> = {
    key: 'txHash',
    title: '',
    align: 'center',
    width: 60,
    render: renderLinkColumn
  }

  const desktopColumns: ColumnsType<Tx> = [typeColumn, fromColumn, toColumn, dateColumn, amountColumn, linkColumn]

  const mobileColumns: ColumnsType<Tx> = [typeColumn, amountColumn, dateColumn, linkColumn]

  const renderTable = useCallback(
    ({ total, tx }: TxPage, loading = false) => {
      const columns = isDesktopView ? desktopColumns : mobileColumns
      return (
        <>
          <Styled.Table columns={columns} dataSource={tx} loading={loading} rowKey="txHash" />
          {total > 0 && (
            <Pagination
              defaultCurrent={1}
              total={total}
              defaultPageSize={MAX_PAGINATION_ITEMS}
              showSizeChanger={false}
              onChange={changePaginationHandler}
            />
          )}
        </>
      )
    },
    [desktopColumns, isDesktopView, mobileColumns, changePaginationHandler]
  )

  const emptyTableData = useMemo((): TxPage => ({ total: 0, tx: [] as Txs }), [])

  const renderContent = useMemo(
    () => (
      <>
        {RD.fold(
          () => renderTable(emptyTableData, true),
          () => {
            const data = FP.pipe(
              previousTxs.current,
              O.getOrElse(() => emptyTableData)
            )
            return renderTable(data, true)
          },
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView title={msg} />
          },
          (data: TxPage): JSX.Element => {
            previousTxs.current = O.some(data)
            return renderTable(data)
          }
        )(txsRD)}
      </>
    ),
    [txsRD, renderTable, emptyTableData]
  )

  return renderContent
}
export default TransactionsTable

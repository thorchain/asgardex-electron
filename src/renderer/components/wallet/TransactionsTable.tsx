import React, { useMemo, useCallback, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Txs, Tx, Address } from '@thorchain/asgardex-binance'
import { assetAmount, bnOrZero, formatAssetAmount } from '@thorchain/asgardex-util'
import { Grid, Col, Row } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl, FormattedDate, FormattedTime } from 'react-intl'

import { TxsRD } from '../../services/binance/types'
import ErrorView from '../shared/error/ErrorView'
import * as Styled from './TransactionTable.style'

type Props = {
  txsRD: TxsRD
  address: O.Option<Address>
  clickTxLinkHandler: (txHash: string) => void
}
const TransactionsTable: React.FC<Props> = (props: Props): JSX.Element => {
  const { txsRD, clickTxLinkHandler } = props
  const intl = useIntl()
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // store previous data of Txs to render these while reloading
  const previousTxs = useRef<O.Option<Txs>>(O.none)

  const renderTypeColumn = useCallback(({ txType }: Tx) => <Styled.Text>{txType}</Styled.Text>, [])
  const typeColumn: ColumnType<Tx> = {
    key: 'txType',
    title: intl.formatMessage({ id: 'common.type' }),
    align: 'left',
    width: 120,
    sorter: (a: Tx, b: Tx) => a.txType.localeCompare(b.txType),
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
    const label = formatAssetAmount(amount, 3)
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
    align: 'left',
    width: 50,
    render: renderLinkColumn
  }

  const desktopColumns: ColumnsType<Tx> = [typeColumn, fromColumn, toColumn, dateColumn, amountColumn, linkColumn]

  const mobileColumns: ColumnsType<Tx> = [amountColumn, dateColumn, linkColumn]

  const renderTable = useCallback(
    (txs: Txs, loading = false) => {
      const columns = isDesktopView ? desktopColumns : mobileColumns
      return <Styled.Table columns={columns} dataSource={txs} loading={loading} rowKey="txHash" />
    },
    [desktopColumns, isDesktopView, mobileColumns]
  )

  const renderContent = useMemo(
    () => (
      <>
        {RD.fold(
          () => renderTable([], true),
          () => {
            const txs = FP.pipe(
              previousTxs.current,
              O.getOrElse(() => [] as Txs)
            )
            return renderTable(txs, true)
          },
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView message={msg} />
          },
          (txs: Txs): JSX.Element => {
            previousTxs.current = O.some(txs)
            return renderTable(txs)
          }
        )(txsRD)}
      </>
    ),
    [txsRD, renderTable]
  )

  return renderContent
}
export default TransactionsTable

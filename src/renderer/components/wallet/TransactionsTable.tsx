import React, { useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Txs, Tx, Address } from '@thorchain/asgardex-binance'
import { assetAmount, bnOrZero, formatAssetAmount } from '@thorchain/asgardex-util'
import { Grid, Col, Row } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
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

  const renderTypeColumn = useCallback(({ txType }: Tx) => <Styled.Text>{txType}</Styled.Text>, [])
  const typeColumn: ColumnType<Tx> = {
    key: 'txType',
    title: intl.formatMessage({ id: 'common.type' }),
    align: 'left',
    width: 120,
    render: renderTypeColumn
  }

  const renderFromColumn = useCallback(({ fromAddr }: Tx) => <Styled.Text>{fromAddr}</Styled.Text>, [])
  const fromColumn: ColumnType<Tx> = {
    key: 'fromAddr',
    title: intl.formatMessage({ id: 'common.from' }),
    align: 'left',
    ellipsis: true,
    render: renderFromColumn
  }

  const renderToColumn = useCallback(({ toAddr }: Tx) => <Styled.Text>{toAddr}</Styled.Text>, [])
  const toColumn: ColumnType<Tx> = {
    key: 'toAddr',
    title: intl.formatMessage({ id: 'common.to' }),
    align: 'left',
    ellipsis: true,
    render: renderToColumn
  }

  const renderDateColumn = useCallback(
    ({ timeStamp }: Tx) => {
      const date = new Date(timeStamp)
      return (
        <Row gutter={[8, 0]}>
          <Col>
            <FormattedDate
              year={isDesktopView ? 'numeric' : '2-digit'}
              month={isDesktopView ? '2-digit' : 'numeric'}
              day={isDesktopView ? '2-digit' : 'numeric'}
              value={date}
            />
          </Col>
          <Col>
            <FormattedTime
              hour={isDesktopView ? '2-digit' : 'numeric'}
              minute={isDesktopView ? '2-digit' : 'numeric'}
              hour12={isDesktopView}
              value={date}
            />
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
    width: isDesktopView ? 200 : 120,
    render: renderDateColumn
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
    render: renderAmountColumn
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
      return <Styled.Table columns={columns} dataSource={txs} loading={loading} rowKey="key" />
    },
    [desktopColumns, isDesktopView, mobileColumns]
  )

  const renderContent = useMemo(
    () => (
      <>
        {RD.fold(
          () => renderTable([], true),
          () => renderTable([], true),
          (error: Error) => {
            const msg = error?.toString() ?? ''
            return <ErrorView message={msg} />
          },
          (txs: Txs): JSX.Element => renderTable(txs)
        )(txsRD)}
      </>
    ),
    [txsRD, renderTable]
  )

  return renderContent
}
export default TransactionsTable

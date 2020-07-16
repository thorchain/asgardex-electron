import React, { useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Txs, Tx, Address } from '@thorchain/asgardex-binance'
import { Grid } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import * as O from 'fp-ts/lib/Option'
import { useIntl, FormattedDate, FormattedTime } from 'react-intl'

import { TxsRD } from '../../services/binance/types'
import ErrorView from '../shared/error/ErrorView'
import * as Styled from './TransactionTable.style'

type Props = {
  txsRD: TxsRD
  address: O.Option<Address>
}
const TransactionsTable: React.FC<Props> = (props: Props): JSX.Element => {
  const { txsRD } = props
  const intl = useIntl()
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const renderTypeColumn = useCallback(({ txType }: Tx) => <Styled.Text>{txType}</Styled.Text>, [])
  const typeColumn: ColumnType<Tx> = {
    key: 'txType',
    title: intl.formatMessage({ id: 'common.type' }),
    dataIndex: 'txType',
    align: 'left',
    render: renderTypeColumn
  }

  const renderFromColumn = useCallback(({ fromAddr }: Tx) => <Styled.Text>{fromAddr}</Styled.Text>, [])
  const fromColumn: ColumnType<Tx> = {
    key: 'fromAddr',
    title: intl.formatMessage({ id: 'common.address' }),
    dataIndex: 'txFrom',
    align: 'left',
    render: renderFromColumn
  }

  const renderToColumn = useCallback(({ toAddr }: Tx) => <Styled.Text>{toAddr}</Styled.Text>, [])
  const toColumn: ColumnType<Tx> = {
    key: 'toAddr',
    title: intl.formatMessage({ id: 'common.to' }),
    dataIndex: 'toAddr',
    align: 'left',
    render: renderToColumn
  }

  const renderDateColumn = useCallback(
    // ({ timeStamp }: Tx) => <Styled.Text>{timeStamp ? new Date(timeStamp).toDateString() : ''}</Styled.Text>,
    ({ timeStamp }: Tx) => {
      const date = new Date(timeStamp)
      return (
        <>
          <FormattedDate value={date} />
          <FormattedTime value={date} />
        </>
      )
    },
    []
  )
  const dateColumn: ColumnType<Tx> = {
    key: 'timeStamp',
    title: intl.formatMessage({ id: 'common.date' }),
    dataIndex: 'timeStamp',
    align: 'left',
    render: renderDateColumn
  }

  const renderAmountColumn = useCallback(({ value }: Tx) => <Styled.Text>{value};</Styled.Text>, [])
  const amountColumn: ColumnType<Tx> = {
    key: 'value',
    title: intl.formatMessage({ id: 'common.amount' }),
    dataIndex: 'txValue',
    align: 'left',
    render: renderAmountColumn
  }

  const renderCoinColumn = useCallback(({ txAsset }: Tx) => <Styled.Text>{txAsset};</Styled.Text>, [])
  const coinColumn: ColumnType<Tx> = {
    key: 'txAsset',
    title: intl.formatMessage({ id: 'common.coin' }),
    dataIndex: 'txAsset',
    align: 'left',
    render: renderCoinColumn
  }

  const renderLinkColumn = useCallback((_) => <Styled.Link>LINK</Styled.Link>, [])
  const linkColumn: ColumnType<Tx> = {
    key: 'txHash',
    title: '',
    dataIndex: 'txHash',
    align: 'left',
    render: renderLinkColumn
  }

  const desktopColumns: ColumnsType<Tx> = [
    typeColumn,
    fromColumn,
    toColumn,
    dateColumn,
    amountColumn,
    coinColumn,
    linkColumn
  ]

  const mobileColumns: ColumnsType<Tx> = [amountColumn, coinColumn, linkColumn]

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

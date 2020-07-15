import React, { useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Txs } from '@thorchain/asgardex-binance'
import { Grid } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import { useIntl } from 'react-intl'

import { shortSymbol } from '../../helpers/tokenHelpers'
import { transactionParty } from '../../helpers/transactionHelpers'
import { TxsRD } from '../../services/binance/types'
import { UserTransactionType } from '../../types/wallet'
import ErrorView from '../shared/error/ErrorView'
import { StyledTable, StyledText, StyledLink } from './UserTransactionTable.style'

type Column = 'type' | 'address' | 'timeStamp' | 'to' | 'amount' | 'coin'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getColumnsRenderers = (address: string): Record<Column, (value: any, tx: UserTransactionType) => JSX.Element> => {
  const party = (tx: UserTransactionType) => {
    return transactionParty(address, tx)
  }

  return {
    type: (_, tx) => {
      const p = party(tx)
      return <StyledText>{p.msg}</StyledText>
    },
    address: (_, tx) => {
      const p = party(tx)
      return <StyledText>{p.address}</StyledText>
    },
    timeStamp: (_, tx) => {
      const p = party(tx)
      return <StyledText>{p.timeStamp ? new Date(p.timeStamp).toDateString() : ''}</StyledText>
    },
    to: (_, tx) => {
      const p = party(tx)
      return <StyledText>{p.label}:&nbsp;</StyledText>
    },
    amount: (_, tx) => {
      const p = party(tx)
      return (
        <StyledText>
          {p.op}
          {tx.value}&nbsp;
        </StyledText>
      )
    },
    coin: (value: string) => {
      return <StyledText>{shortSymbol(value)}</StyledText>
    }
  }
}

type Props = {
  txsRD: TxsRD
}
const TransactionsTable: React.FC<Props> = (props: Props): JSX.Element => {
  const { txsRD } = props
  const intl = useIntl()
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const address = 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y'

  const columnsRenderers = useMemo(() => getColumnsRenderers(address), [address])

  const typeColumn: ColumnType<UserTransactionType> = {
    key: 'txType',
    title: intl.formatMessage({ id: 'common.type' }),
    dataIndex: 'txType',
    align: 'left',
    render: columnsRenderers.type
  }

  const fromColumn: ColumnType<UserTransactionType> = {
    key: 'fromAddr',
    title: intl.formatMessage({ id: 'common.address' }),
    dataIndex: 'txFrom',
    align: 'left',
    render: columnsRenderers.address
  }

  const toColumn: ColumnType<UserTransactionType> = {
    key: 'toAddr',
    title: intl.formatMessage({ id: 'common.to' }),
    dataIndex: 'toAddr',
    align: 'left',
    render: columnsRenderers.to
  }

  const dateColumn: ColumnType<UserTransactionType> = {
    key: 'timeStamp',
    title: intl.formatMessage({ id: 'common.date' }),
    dataIndex: 'timeStamp',
    align: 'left',
    render: columnsRenderers.timeStamp
  }

  const amountColumn: ColumnType<UserTransactionType> = {
    key: 'value',
    title: intl.formatMessage({ id: 'common.amount' }),
    dataIndex: 'txValue',
    align: 'left',
    render: columnsRenderers.amount
  }

  const coinColumn: ColumnType<UserTransactionType> = {
    key: 'txAsset',
    title: intl.formatMessage({ id: 'common.coin' }),
    dataIndex: 'txAsset',
    align: 'left',
    render: columnsRenderers.coin
  }

  const linkColumn: ColumnType<UserTransactionType> = {
    key: 'txHash',
    title: '',
    dataIndex: 'txHash',
    align: 'left',
    render: () => <StyledLink>LINK</StyledLink>
  }

  const desktopColumns: ColumnsType<UserTransactionType> = [
    typeColumn,
    fromColumn,
    toColumn,
    dateColumn,
    amountColumn,
    coinColumn,
    linkColumn
  ]

  const mobileColumns: ColumnsType<UserTransactionType> = [amountColumn, coinColumn, linkColumn]

  const renderTable = useCallback(
    (data: Txs, loading = false) => {
      const columns = isDesktopView ? desktopColumns : mobileColumns
      return <StyledTable columns={columns} dataSource={data} loading={loading} rowKey="key" />
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
          // success state
          (txs: Txs): JSX.Element => renderTable(txs)
        )(txsRD)}
      </>
    ),
    [txsRD, renderTable]
  )

  return renderContent
}
export default TransactionsTable

import React, { useMemo } from 'react'

import { Grid } from 'antd'
import { ColumnsType, ColumnType } from 'antd/lib/table'
import { useIntl } from 'react-intl'

import { shortSymbol } from '../../helpers/tokenHelpers'
import { transactionParty } from '../../helpers/transactionHelpers'
import { UserTransactionType } from '../../types/wallet'
import { StyledTable, StyledText, StyledLink } from './UserTransactionTable.style'

type Props = {
  transactions: UserTransactionType[]
}

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

const TransactionsTable: React.FC<Props> = ({ transactions }): JSX.Element => {
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

  return (
    <StyledTable
      columns={isDesktopView ? desktopColumns : mobileColumns}
      dataSource={transactions}
      rowKey="_id"
      pagination={false}
    />
  )
}
export default TransactionsTable

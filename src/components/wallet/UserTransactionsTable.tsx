import React, { useMemo } from 'react'

import { Table } from 'antd'
import { useIntl } from 'react-intl'

import { shortSymbol } from '../../helpers/tokenHelpers'
import { transactionParty } from '../../helpers/transactionHelpers'
import { UserTransactionType } from '../../types/wallet'
import { StyledTable, StyledText, StyledLink } from './UserTransactionTable.style'

type Props = {
  transactions: UserTransactionType[]
}

type Column = 'type' | 'address' | 'to' | 'amount' | 'coin'

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

  const address = 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y'

  const columnsRenderers = useMemo(() => getColumnsRenderers(address), [address])

  return (
    <StyledTable dataSource={transactions} rowKey="_id" pagination={false}>
      <Table.Column
        title={intl.formatMessage({ id: 'common.type' })}
        dataIndex="txType"
        align="left"
        render={columnsRenderers.type}
      />
      <Table.Column
        title={intl.formatMessage({ id: 'common.address' })}
        dataIndex="txFrom"
        align="left"
        render={columnsRenderers.address}
      />
      <Table.Column
        title={intl.formatMessage({ id: 'common.to' })}
        dataIndex="Type"
        align="left"
        render={columnsRenderers.to}
      />
      <Table.Column
        title={intl.formatMessage({ id: 'common.amount' })}
        dataIndex="txValue"
        align="left"
        render={columnsRenderers.amount}
      />
      <Table.Column
        title={intl.formatMessage({ id: 'common.coin' })}
        dataIndex="txAsset"
        align="left"
        render={columnsRenderers.coin}
      />
      <Table.Column
        title=""
        dataIndex="txHash"
        align="left"
        render={() => {
          return <StyledLink>LINK</StyledLink>
        }}
      />
    </StyledTable>
  )
}
export default TransactionsTable

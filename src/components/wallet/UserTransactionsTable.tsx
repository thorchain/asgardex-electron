import React from 'react'

import { Table } from 'antd'
import { useIntl } from 'react-intl'

import { shortSymbol } from '../../helpers/tokenHelpers'
import { transactionParty } from '../../helpers/transactionHelpers'
import { UserTransactionType } from '../../types/wallet'
import { StyledTable, StyledText, StyledLink } from './UserTransactionTable.style'

type Props = {
  transactions: UserTransactionType[]
}

const TransactionsTable: React.FC<Props> = ({ transactions }): JSX.Element => {
  const intl = useIntl()

  const address = 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y'
  const party = (tx: UserTransactionType) => {
    return transactionParty(address, tx)
  }
  return (
    <StyledTable dataSource={transactions} rowKey="_id" pagination={false}>
      <Table.Column
        title={intl.formatMessage({ id: 'common.type' })}
        dataIndex="txType"
        align="left"
        render={(_, tx: UserTransactionType) => {
          const p = party(tx)
          return <StyledText>{p.msg}</StyledText>
        }}
      />
      <Table.Column
        title={intl.formatMessage({ id: 'common.address' })}
        dataIndex="txFrom"
        align="left"
        render={(_, tx: UserTransactionType) => {
          const p = party(tx)
          return <StyledText>{p.address}</StyledText>
        }}
      />
      <Table.Column
        title={intl.formatMessage({ id: 'common.to' })}
        dataIndex="Type"
        align="left"
        render={(_, tx: UserTransactionType) => {
          const p = party(tx)
          return <StyledText>{p.label}:&nbsp;</StyledText>
        }}
      />
      <Table.Column
        title={intl.formatMessage({ id: 'common.amount' })}
        dataIndex="txValue"
        align="left"
        render={(_, tx: UserTransactionType) => {
          const p = party(tx)
          return (
            <StyledText>
              {p.op}
              {tx.value}&nbsp;
            </StyledText>
          )
        }}
      />
      <Table.Column
        title={intl.formatMessage({ id: 'common.coin' })}
        dataIndex="txAsset"
        align="left"
        render={(value: string) => {
          return <StyledText>{shortSymbol(value)}</StyledText>
        }}
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

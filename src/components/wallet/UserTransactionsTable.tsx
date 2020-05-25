import React from 'react'

import { Typography, Table } from 'antd'

import { shortSymbol } from '../../helpers/tokenHelpers'
import { transactionParty } from '../../helpers/transactionHelpers'
import { UserTransactionType } from '../../types/wallet'
const { Text } = Typography

type Props = { transactions: UserTransactionType[] }
const TransactionsTable: React.FC<Props> = ({ transactions }): JSX.Element => {
  const address = 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y'
  const party = (tx: UserTransactionType) => {
    return transactionParty(address, tx)
  }
  return (
    <Table size="small" dataSource={transactions} rowKey="_id" pagination={false}>
      <Table.Column
        title="Type"
        dataIndex="txType"
        width="1px"
        render={(value, tx: UserTransactionType) => {
          const p = party(tx)
          return <span style={{ textTransform: 'uppercase' }}>{p.msg}</span>
        }}
      />
      <Table.Column
        title="Party"
        dataIndex="Type"
        render={(value, tx: UserTransactionType) => {
          const p = party(tx)
          return <Text strong>{p.label}:&nbsp;</Text>
        }}
      />
      <Table.Column
        title="Address"
        dataIndex="txFrom"
        render={(value, tx: UserTransactionType) => {
          const p = party(tx)
          return (
            <Text ellipsis style={{ fontFamily: 'monospace' }}>
              {p.address}
            </Text>
          )
        }}
      />
      <Table.Column
        title="Amount"
        dataIndex="txValue"
        align="right"
        width="1px"
        render={(value, tx: UserTransactionType) => {
          const p = party(tx)
          return (
            <Text>
              {p.op}
              {tx.value}&nbsp;
            </Text>
          )
        }}
      />
      <Table.Column
        title="Asset"
        dataIndex="txAsset"
        render={(value: string) => {
          return <Text type="secondary">{shortSymbol(value)}</Text>
        }}
      />
      <Table.Column
        title="Link"
        dataIndex="txHash"
        render={() => {
          return <div>LINK</div>
        }}
      />
    </Table>
  )
}
export default TransactionsTable

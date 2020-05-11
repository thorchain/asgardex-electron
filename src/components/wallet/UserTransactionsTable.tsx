import React from 'react'
import { shortSymbol } from '../../helpers/tokenHelpers'
import { Typography, Table } from 'antd'
const { Text } = Typography

export type UserTransactionTypes = {
  _id?: number
  blockHeight?: number
  code?: number
  confirmBlocks?: number
  data?: string | null
  fromAddr?: string | null
  memo?: string
  orderId?: number | null
  proposalId?: string | null
  sequence?: number
  source?: number
  timeStamp?: string
  toAddr?: string | null
  txAge?: number
  txAsset: string
  txFee: string
  txHash: string
  txType: string
  value: string
}

type Props = { transactions: UserTransactionTypes[] }
const TransactionsTable: React.FC<Props> = ({ transactions }): JSX.Element => {
  const address = 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y'
  const party = (tx: UserTransactionTypes) => {
    const from = tx.fromAddr
    const to = tx.toAddr
    switch (tx.txType) {
      case 'TRANSFER':
        if (from === address) {
          return { msg: 'send', label: 'to', address: to, color: 'error', op: '-' }
        } else {
          return { msg: 'receive', label: 'from', address: from, color: 'success', op: '+' }
        }
      case 'FREEZE_TOKEN':
        return { msg: 'freeze', label: 'from', address: from, color: 'info', op: '-' }
      case 'UN_FREEZE_TOKEN':
        return { msg: 'unfreeze', label: 'to', address: from, color: 'warning', op: '+' }
      case 'outboundTransferInfo':
        if (from === address) {
          return { msg: 'pending', label: 'to', address: to, color: 'secondary', op: '-' }
        } else {
          return { msg: 'pending', label: 'from', address: from, color: 'secondary', op: '+' }
        }

      default:
        return { msg: 'pending', label: '', address: '', color: '', op: '' }
    }
  }
  return (
    <Table size="small" dataSource={transactions} rowKey="_id" pagination={false}>
      <Table.Column
        title="Type"
        dataIndex="txType"
        width="1px"
        render={(value, tx: UserTransactionTypes) => {
          const p = party(tx)
          return <span style={{ textTransform: 'uppercase' }}>{p.msg}</span>
        }}
      />
      <Table.Column
        title="Party"
        dataIndex="Type"
        render={(value, tx: UserTransactionTypes) => {
          const p = party(tx)
          return <Text strong>{p.label}:&nbsp;</Text>
        }}
      />
      <Table.Column
        title="Address"
        dataIndex="txFrom"
        render={(value, tx: UserTransactionTypes) => {
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
        render={(value, tx: UserTransactionTypes) => {
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

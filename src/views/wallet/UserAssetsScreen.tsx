import React, { useState } from 'react'

import { Row, Col, Table } from 'antd'
import { GetComponentProps, GetRowKey } from 'rc-table/lib/interface'
import { useHistory } from 'react-router-dom'

import Coin from '../../components/uielements/coins/coin'
import * as walletRoutes from '../../routes/wallet'
import { TableWrapper } from './UserAssetsScreen.style'

export type WalletAsset = {
  symbol: string
  ticker: string
  balance: number
  value: number
}

export type WalletAssets = WalletAsset[]

const mockData: WalletAssets = [
  {
    symbol: 'RUNE',
    ticker: 'RUNE',
    balance: 2345,
    value: 123
  },
  {
    symbol: 'BNB',
    ticker: 'BNB',
    balance: 1238,
    value: 123
  },
  {
    symbol: 'RUNE',
    ticker: 'RUNE',
    balance: 2345,
    value: 123
  },
  {
    symbol: 'BNB',
    ticker: 'BNB',
    balance: 8739,
    value: 123
  }
]

const UserAssetsScreen: React.FC = (): JSX.Element => {
  const history = useHistory()

  // const [assets] = useState<Balances>([])
  const [assets] = useState<WalletAsset[]>(mockData)

  const getRowKey = ({ symbol }: WalletAsset) => symbol

  const onRowHandler: GetComponentProps<WalletAsset> = ({ symbol }: WalletAsset) => {
    return {
      onClick: () => {
        history.push(walletRoutes.assetDetails.path({ symbol: symbol }))
      }
    }
  }

  return (
    <Row>
      <Col span={24}>
        <TableWrapper
          dataSource={assets}
          loading={false}
          rowKey={getRowKey as GetRowKey<object>}
          pagination={false}
          onRow={onRowHandler as GetComponentProps<object>}>
          <Table.Column
            dataIndex="symbol"
            key="icon"
            width={1}
            render={(symbol) => <Coin type={symbol} size="big" />}
          />
          <Table.Column title="Name" dataIndex="symbol" />
          <Table.Column title="Ticker" dataIndex="ticker" />
          <Table.Column title="Balance" dataIndex="balance" />
          <Table.Column title="Value" dataIndex="value" width={1} />
        </TableWrapper>
      </Col>
    </Row>
  )
}

export default UserAssetsScreen

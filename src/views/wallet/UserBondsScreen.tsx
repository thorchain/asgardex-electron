import React, { useEffect, useState } from 'react'
import { Row, Col, Table } from 'antd'
import DynamicCoin from '../../components/shared/CoinIcons/DynamicCoin'

type UserAssetType = {
  _id: string
  free: number
  frozen: number
  locked: number
  symbol: string
  name: string
  value: string
}

// Dummy data
const UserAssets: UserAssetType[] = [
  { _id: '1', free: 99, frozen: 11, locked: 21, symbol: 'BNB-JST', name: 'Binance', value: '0.99' },
  { _id: '2', free: 1034, frozen: 38, locked: 101, symbol: 'RUNE-1E0', name: 'Rune', value: '0.25' }
]

const UserBondsScreen: React.FC = (): JSX.Element => {
  const [assets, setAssets] = useState<UserAssetType[]>([])

  function setData() {
    const res = UserAssets
    if (res.length > 0) {
      setAssets(res)
    }
  }
  useEffect(() => {
    setData()
  }, [])
  return (
    <Row>
      <Col span={24}>
        <Table dataSource={assets} rowKey="_id" pagination={false}>
          <Table.Column
            title="Icon"
            dataIndex="symbol"
            key="icon"
            render={(symbol) => <DynamicCoin type={symbol} size={'normal'} />}
          />
          <Table.Column title="Name" dataIndex="name" />
          <Table.Column title="Symbol" dataIndex="symbol" />
          <Table.Column title="Locked" dataIndex="locked" />
          <Table.Column title="Value" dataIndex="value" width={1} />
        </Table>
      </Col>
    </Row>
  )
}

export default UserBondsScreen

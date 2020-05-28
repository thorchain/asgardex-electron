import React, { useEffect, useState, useMemo } from 'react'

import { Client as BinanceClient, Balances } from '@thorchain/asgardex-binance'
import { Row, Col, Table } from 'antd'
import { useHistory } from 'react-router-dom'

import DynamicCoin from '../../components/shared/icons/DynamicCoin'
import * as walletRoutes from '../../routes/wallet'

const UserAssetsScreen: React.FC = (): JSX.Element => {
  const history = useHistory()

  // TODO (@Veado) Add network to Client
  const ct = useMemo(() => new BinanceClient(), [])
  const [assets, setAssets] = useState<Balances>([])

  useEffect(() => {
    const setData = async () => {
      await ct.init()
      const address = localStorage.getItem('address')
      if (address) {
        const res: Balances = await ct.getBalance(address)
        if (res) setAssets(res)
      }
    }
    setData()
  }, [ct])
  return (
    <Row>
      <Col span={24}>
        <Table
          dataSource={assets}
          loading={assets.length <= 0}
          rowKey={({ symbol }) => {
            return symbol
          }}
          pagination={false}
          onRow={(record) => {
            return {
              onClick: () => {
                history.push(walletRoutes.assetDetails.path({ symbol: record.symbol }))
              }
            }
          }}>
          <Table.Column
            title="Icon"
            dataIndex="symbol"
            key="icon"
            render={(symbol) => <DynamicCoin type={symbol} size={'normal'} />}
          />
          <Table.Column title="Name" dataIndex="name" />
          <Table.Column title="Symbol" dataIndex="symbol" />
          <Table.Column title="Balance" dataIndex="free" />
          <Table.Column title="Value" dataIndex="value" width={1} />
        </Table>
      </Col>
    </Row>
  )
}

export default UserAssetsScreen

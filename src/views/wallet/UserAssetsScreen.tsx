import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import * as walletRoutes from '../../routes/wallet'
import { Row, Col, Table } from 'antd'
import DynamicCoin from '../../components/shared/icons/DynamicCoin'

import { client } from '@thorchain/asgardex-binance'

import { Balance } from '@thorchain/asgardex-binance/lib/types/binance'

const UserAssetsScreen: React.FC = (): JSX.Element => {
  const history = useHistory()
  const [assets, setAssets] = useState<Balance[]>([]) // Balance is an object, see below
  async function setData() {
    const ct = await client()
    const address = localStorage.getItem('address')
    if (address) {
      // Temporary disabled as type returned is not array
      // Issue here: https://gitlab.com/thorchain/asgardex-common/asgardex-binance/-/issues/1
      /*eslint-disable*/
      const res: any = await ct.getBalance(address)
      if (res) setAssets(res)
      /*eslint-enable*/
    }
  }
  useEffect(() => {
    setData()
  }, [])
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

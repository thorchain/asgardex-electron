import React, { useEffect, useState } from 'react'
import { Row, Col, Table } from 'antd'
import { useHistory } from 'react-router-dom'
import { BinanceBalancesService } from '../../contexts/WalletDatastore/storage/binance/services/BinanceBalancesService'
import { UserSettingsService } from '../../contexts/WalletDatastore/storage/services/userSettingsService'
import { BinanceBalanceType as BalanceType } from '../../contexts/WalletDatastore/storage/binance/types/BinanceBalanceType'

import DynamicCoin from '../../components/shared/icons/DynamicCoin'
import * as walletRoutes from '../../routes/wallet'

const UserAssetsScreen: React.FC = (): JSX.Element => {
  const history = useHistory()
  const [assets, setAssets] = useState<BalanceType[]>([])
  const user = new UserSettingsService()
  async function setData() {
    const usr = await user.findOne()
    if (usr) {
      console.log('we go the user')
      const balances = new BinanceBalancesService()
      const res = await balances.findAll<BalanceType>()
      setAssets(res)
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

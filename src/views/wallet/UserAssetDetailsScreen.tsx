import React from 'react'
import DynamicCoin from '../../components/shared/CoinIcons/DynamicCoin'
import { shortSymbol } from '../../helpers/tokenHelpers'
import { Row, Col, Typography, Divider, Button, Card } from 'antd'
const { Title } = Typography

type UserAssetType = {
  _id: string
  free: number
  full: number
  frozen: number
  locked: number
  symbol: string
  name: string
  value: string
}

const UserAssetDetailsScreen: React.FC = (): JSX.Element => {
  const asset: UserAssetType = {
    _id: '2',
    free: 1034,
    frozen: 38,
    locked: 101,
    symbol: 'RUNE-1E0',
    name: 'Rune',
    value: '0.25',
    full: 201
  }
  const freezable = () => asset.free > 0
  const unfreezable = () => asset.frozen > 0
  const sendable = () => asset.free > 0
  const goRoute = (route: string) => {
    switch (route) {
      case 'walletSend':
        console.log('go to send funds')
        break
      case 'walletFreeze':
        console.log('go to freeze funds')
        break
      case 'walletUnfreeze':
        console.log('go to unfreeze funds')
        break
      case 'walletReceive':
        console.log('go to receive funds')
        break

      default:
        break
    }
  }

  return (
    <Row>
      <Col span={24} md={{ span: 16, offset: 4 }} lg={{ span: 12, offset: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Card bordered={false}>
            <DynamicCoin type={asset.symbol} size="big" />
          </Card>
          <Title level={4}>NAME: {shortSymbol(asset?.symbol)}</Title>
          <div>{asset.symbol}</div>
          <Title level={3}>
            {asset.full.toLocaleString()} <small>{shortSymbol(asset.symbol)}</small>
          </Title>
        </div>
      </Col>

      <Col span={24} md={{ span: 16, offset: 4 }} lg={{ span: 12, offset: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          <div>
            <div>Free:</div>
            <Title level={4}>{asset?.free?.toLocaleString()}</Title>
          </div>

          <div>
            <div>Frozen:</div>
            <Title level={4}>{asset?.frozen?.toLocaleString()}</Title>
          </div>

          <div>
            <div>Locked:</div>
            <Title level={4}>{asset?.locked?.toLocaleString()}</Title>
          </div>
        </div>
      </Col>

      <Divider />

      <Col span={24} md={{ span: 16, offset: 4 }} lg={{ span: 12, offset: 6 }}>
        <Row>
          <Col span={12}>
            <Card bordered={false}>
              <Button type="primary" size="large" block disabled={!sendable()} onClick={() => goRoute('walletSend')}>
                Send
              </Button>
              <Button type="link" block disabled={!freezable()} onClick={() => goRoute('walletFreeze')}>
                Freeze
              </Button>
              <small>Freeze assets on address</small>
            </Card>
          </Col>

          <Col span={12}>
            <Card bordered={false}>
              <Button type="primary" size="large" block onClick={() => goRoute('walletReceive')}>
                Receive
              </Button>
              <Button type="link" block disabled={!unfreezable()} onClick={() => goRoute('walletUnfreeze')}>
                Unfreeze
              </Button>
              <small>Unfreeze assets on address</small>
            </Card>
          </Col>
        </Row>
      </Col>
      <Divider />
      <Col>{/* <TransactionsTable transactions={txs} /> */}</Col>
    </Row>
  )
}
export default UserAssetDetailsScreen

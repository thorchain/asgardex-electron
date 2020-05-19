import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { AssetDetailsRouteParams } from '../../routes/wallet'
import TransactionsTable from '../../components/wallet/UserTransactionsTable'
import { UserTransactionType, UserAssetType } from '../../types/wallet'
import DynamicCoin from '../../components/shared/icons/DynamicCoin'
import { shortSymbol } from '../../helpers/tokenHelpers'
import * as walletRoutes from '../../routes/wallet'
import { Row, Col, Typography, Divider, Button, Card } from 'antd'
const { Title } = Typography

// Dummy data
const txs: UserTransactionType[] = [
  {
    _id: 0,
    blockHeight: 74645396,
    code: 0,
    confirmBlocks: 0,
    data: null,
    fromAddr: 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y',
    memo: '',
    orderId: null,
    proposalId: null,
    sequence: 29,
    source: 0,
    timeStamp: '2020-04-01T03:46:55.786Z',
    toAddr: null,
    txAge: 1578666,
    txAsset: 'RUNE-A1F',
    txFee: '0.00500000',
    txHash: '320C31E9B5E5D21B4912BBC09C4A6F04EC4666698D6EAEBBBA3DBFAA7B9D17B3',
    txType: 'FREEZE_TOKEN',
    value: '12.00000000'
  }
]

const UserAssetDetailsScreen: React.FC = (): JSX.Element => {
  const { symbol } = useParams<AssetDetailsRouteParams>()
  const history = useHistory()
  // Dummy data
  const asset: UserAssetType = {
    _id: '2',
    free: 1034,
    frozen: 38,
    locked: 101,
    symbol: symbol,
    name: shortSymbol(symbol),
    full: 1173
  }
  const sendable = () => asset.free > 0

  return (
    <Row>
      <Col span={24} md={{ span: 16, offset: 4 }} lg={{ span: 12, offset: 6 }}>
        <Card bordered={false} bodyStyle={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ margin: '24px' }}>
            <DynamicCoin type={asset.symbol} size="big" />
          </div>
          <Title level={4}>NAME: {shortSymbol(asset.symbol)}</Title>
          <div>{asset.symbol}</div>
          <Title level={3}>
            {asset.full?.toLocaleString()} <small>{shortSymbol(asset.symbol)}</small>
          </Title>
        </Card>
      </Col>

      <Col span={24} md={{ span: 16, offset: 4 }} lg={{ span: 12, offset: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          <div>
            <div>Free:</div>
            <Title level={4}>{asset.free.toLocaleString()}</Title>
          </div>

          <div>
            <div>Frozen:</div>
            <Title level={4}>{asset.frozen.toLocaleString()}</Title>
          </div>

          <div>
            <div>Locked:</div>
            <Title level={4}>{asset.locked.toLocaleString()}</Title>
          </div>
        </div>
      </Col>

      <Divider />

      <Col span={24} md={{ span: 16, offset: 4 }} lg={{ span: 12, offset: 6 }}>
        <Row>
          <Col span={12}>
            <Card bordered={false}>
              <Button
                type="primary"
                shape="round"
                size="large"
                block
                disabled={!sendable()}
                onClick={() => history.push(walletRoutes.fundsSend.path())}>
                Send
              </Button>
            </Card>
          </Col>

          <Col span={12}>
            <Card bordered={false}>
              <Button
                type="ghost"
                shape="round"
                size="large"
                block
                onClick={() => history.push(walletRoutes.fundsReceive.path())}>
                Receive
              </Button>
            </Card>
          </Col>
        </Row>
      </Col>
      <Divider />
      <Col span={24}>
        <TransactionsTable transactions={txs} />
      </Col>
    </Row>
  )
}
export default UserAssetDetailsScreen

import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { Row, Col, Typography, Button, Card, List } from 'antd'
import { PlusCircleFilled, CloseCircleOutlined } from '@ant-design/icons'
import { UserAccountType } from '../../types/wallet'
import { client as binance } from '@thorchain/asgardex-binance'
import { BinanceClient } from '@thorchain/asgardex-binance/lib/index'
import { KeyStore } from '@binance-chain/javascript-sdk/typings/crypto'
const { Title, Text, Paragraph } = Typography

// Dummy Data
const UserAccounts: UserAccountType[] = [
  {
    chainName: 'Binancechain',
    accounts: [
      {
        name: 'Main',
        address: 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y',
        type: 'internal'
      },
      {
        name: 'Ledger',
        address: 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y',
        type: 'external'
      }
    ]
  },
  {
    chainName: 'EthereumClassic',
    accounts: [
      {
        name: 'Metamask',
        address: '0x910286F93b230E221384844C4ae18a14c474E74E',
        type: 'external'
      }
    ]
  }
]
// Dummy data... types not confirmed

const WalletManage: React.FC = (): JSX.Element => {
  const [keystore, setKeystore] = useState<KeyStore>()
  const [network, setNetwork] = useState<string | null>()
  const [chainId, setChainId] = useState<string | null>()
  const [address, setAddress] = useState<string | null>('')
  async function setData() {
    const key: string | null = localStorage.getItem('binance')
    if (key) {
      setKeystore(JSON.parse(key))
    }
    const ct: BinanceClient = await binance()
    if (ct) {
      setNetwork('testnet')
      setChainId('Binance-Nile')
    }
    setAddress(localStorage.getItem('address'))
  }
  useEffect(() => {
    setData()
  }, [])
  const fileName = (): string | undefined => address?.concat('-keystore.txt')
  const downloadLink: string = useMemo(() => {
    const keystring: string = localStorage.getItem('binance') || ''
    return 'data:text/plain;charset=utf-8,' + encodeURIComponent(keystring)
  }, [])
  const removeWallet = useCallback(() => {
    console.log('removing wallet...')
    localStorage.removeItem('binance')
    localStorage.removeItem('address')
  }, [])
  return (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Title level={4}>Settings</Title>
        <Paragraph strong>Wallet Management</Paragraph>
        <Card>
          <Row>
            <Col span={12}>
              <Card bordered={false}>
                <Button type="ghost" shape="round" block href={downloadLink} download={fileName()}>
                  Export Keystore
                </Button>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false}>
                <Button type="ghost" shape="round" block>
                  Lock Wallet
                </Button>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false}>
                <Button type="ghost" shape="round" block disabled={true}>
                  View Phrase
                </Button>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false}>
                <Button type="ghost" danger shape="round" block onClick={removeWallet}>
                  Remove Wallet
                </Button>
              </Card>
            </Col>
          </Row>
        </Card>
        <Paragraph strong>Network Client</Paragraph>
        <Card>
          <Row>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <Text strong>Client Address:</Text>
              <Paragraph ellipsis>{address}</Paragraph>
            </Col>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <Text strong>Keystore Version:</Text>
              <Paragraph>{keystore?.version}</Paragraph>
            </Col>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <Text strong>Type:</Text>
              <Paragraph>{network}</Paragraph>
            </Col>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <Text strong>Chain ID:</Text>
              <Paragraph>{chainId}</Paragraph>
            </Col>
          </Row>
        </Card>
      </Col>

      <Col sm={{ span: 24 }} md={{ span: 12 }}>
        <Paragraph strong>Manage Accounts</Paragraph>
        <Card title="Accounts">
          <List
            dataSource={UserAccounts}
            renderItem={(item, i: number) => (
              <List.Item style={{ flexDirection: 'column', alignItems: 'start' }} key={i}>
                <Text strong>{item.chainName}</Text>
                {item.accounts.map((acc, j) => (
                  <div key={j}>
                    <Text type="secondary">{acc.name}</Text>
                    <Paragraph ellipsis>
                      {acc.address}
                      {acc.type === 'external' && (
                        <Button type="link" danger>
                          <CloseCircleOutlined />
                        </Button>
                      )}
                    </Paragraph>
                  </div>
                ))}
              </List.Item>
            )}
          />
          <Button type="link">
            <PlusCircleFilled />
            Add Device
          </Button>
        </Card>
      </Col>
    </Row>
  )
}

export default WalletManage

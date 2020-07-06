import React, { useMemo, useCallback, useState, useEffect } from 'react'

import { PlusCircleFilled, CloseCircleOutlined } from '@ant-design/icons'
import { Address } from '@thorchain/asgardex-binance'
import { Row, Col, Typography, Button, Card, List } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { Network } from '../../services/app/types'
import { UserAccountType } from '../../types/wallet'

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

type Props = {
  network: Network
  toggleNetwork?: () => void
  address: O.Option<Address>
  lockWallet?: () => void
  removeKeystore?: () => void
}

const Settings: React.FC<Props> = (props: Props): JSX.Element => {
  const { network, toggleNetwork = () => {}, address, lockWallet = () => {}, removeKeystore = () => {} } = props

  const [chainId, setChainId] = useState<string | null>()

  async function setData() {
    // Temporary network client settings placeholders
    setChainId('unknown')
  }
  useEffect(() => {
    setData()
  }, [])

  const downloadLink: string = useMemo(() => {
    const keystring: string = localStorage.getItem('keystore') || ''
    return 'data:text/plain;charset=utf-8,' + encodeURIComponent(keystring)
  }, [])

  const removeWallet = useCallback(() => {
    removeKeystore()
  }, [removeKeystore])

  return (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Title level={4}>Settings</Title>
        <Paragraph strong>Wallet Management</Paragraph>
        <Card>
          <Row>
            <Col span={12}>
              <Card bordered={false}>
                <Button type="ghost" shape="round" block href={downloadLink} download={''}>
                  Export Keystore
                </Button>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false}>
                <Button type="ghost" shape="round" block onClick={lockWallet}>
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
              <Paragraph>
                {FP.pipe(
                  address,
                  O.getOrElse(() => '')
                )}
              </Paragraph>
            </Col>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <Text strong>Keystore Version:</Text>
              <Paragraph></Paragraph>
            </Col>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <Text strong>Type:</Text>
              <Paragraph>{network}</Paragraph>
            </Col>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <Text strong>Chain ID:</Text>
              <Paragraph>{chainId}</Paragraph>
            </Col>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <Button onClick={toggleNetwork}>Change to {network === Network.MAIN ? 'testnet' : 'mainnet'}</Button>
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

export default Settings

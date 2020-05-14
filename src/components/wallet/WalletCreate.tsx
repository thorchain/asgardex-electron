import React, { useCallback } from 'react'
import { Row, Col, Typography, Tabs } from 'antd'
import ImportMnemonicForm from './forms/ImportMnemonicForm'
const { Title, Text } = Typography
const { TabPane } = Tabs

const WalletCreate: React.FC = (): JSX.Element => {
  const handleTabsChange = useCallback((activeKey: string) => {
    // use this placeholder method to reset forms is necessary
    console.log('changed tabs...')
    console.log(activeKey)
  }, [])
  return (
    <Row>
      <Col md={{ span: 16, offset: 4 }}>
        <Title level={4}>New Wallet</Title>
        <Tabs defaultActiveKey="1" size="large" onChange={handleTabsChange}>
          <TabPane tab="Import" key="1">
            <ImportMnemonicForm />
          </TabPane>
          <TabPane tab="Create" key="2">
            <Text type="secondary">Placeholder for new mnemonic </Text>
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  )
}
export default WalletCreate

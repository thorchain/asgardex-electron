import React from 'react'
import { Row, Col, Typography, Tabs } from 'antd'
import ImportMnemonicForm from './forms/ImportMnemonicForm'
import NewMnemonic from './NewMnemonic'
import NewMnemonicConfirm from './NewMnemonicConfirm'
const { Title } = Typography
const { TabPane } = Tabs

const WalletCreate: React.FC = (): JSX.Element => {
  return (
    <Row>
      <Col md={{ span: 16, offset: 4 }}>
        <Title level={4}>New Wallet</Title>
        <Tabs defaultActiveKey="1" size="large">
          <TabPane tab="Import" key="1">
            <ImportMnemonicForm />
          </TabPane>
          <TabPane tab="Create" key="2">
            <NewMnemonic />
          </TabPane>
          <TabPane tab="Confirm" key="3">
            <NewMnemonicConfirm />
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  )
}
export default WalletCreate

import React, { useState, useCallback } from 'react'

import { Row, Col, Typography, Tabs } from 'antd'
const { Title } = Typography
const { TabPane } = Tabs;

import ImportMnemonicForm from './forms/ImportMnemonicForm'

const ImportScreen: React.FC = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState('1')
  const handleTabsChange = useCallback((activeKey:string) => { setActiveTab(activeKey) },[activeTab])
  const isActiveTab = (keynum:string) => { return (keynum === activeTab) }
  return (
    <Row>
      <Col md={{span:16,offset:4}}>
        <Title level={4}>Import Existing</Title>
        <Tabs defaultActiveKey="1" size="large" onChange={handleTabsChange}>
          <TabPane tab="Keystore" key="1">
            <h3>tab1</h3>
          </TabPane>
          <TabPane tab="Mnemonic" key="2">
            <ImportMnemonicForm activetab={isActiveTab('2')}/>
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  )
}
export default ImportScreen



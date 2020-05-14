import React from 'react'
import { Row, Col, Tabs, Tag } from 'antd'
import WalleteManage from '../../components/wallet/WalletManage'
import WalletCreate from '../../components/wallet/WalletCreate'
const { TabPane } = Tabs

const UserAccountsScreen: React.FC = (): JSX.Element => {
  return (
    <Row>
      <Col span={24}>
        {/* These tabs for for convenience during development. TODO: Replace with routeing/rendering logic */}
        <Tabs defaultActiveKey="1" size="large" tabBarExtraContent={<Tag>temporary</Tag>}>
          <TabPane tab="New Wallet" key="1">
            <WalletCreate />
          </TabPane>
          <TabPane tab="Settings" key="2">
            <WalleteManage />
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  )
}

export default UserAccountsScreen

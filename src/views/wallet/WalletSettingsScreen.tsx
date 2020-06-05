import React from 'react'

import { Row, Col } from 'antd'

import WalleteManage from '../../components/wallet/WalletManage'

const UserAccountsScreen: React.FC = (): JSX.Element => {
  return (
    <Row>
      <Col span={24}>
        <WalleteManage />
      </Col>
    </Row>
  )
}

export default UserAccountsScreen

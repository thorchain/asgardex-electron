import React, { useMemo, useCallback } from 'react'
import { Row, Col, Typography, Button, Card, List } from 'antd'
const { Title, Text, Paragraph } = Typography
import WalleteManage from '../../components/wallet/WalletManage'
import WalletImport from '../../components/wallet/WalletImport'

// Dummy Data
const UserAccountsScreen: React.FC = (): JSX.Element => {
  return (
    <Row>
      <Title level={3}>Settings</Title>
      <Col span={24}>
        <WalleteManage />
        <WalletImport />
      </Col>
    </Row>
  )
}

export default UserAccountsScreen

import React, { useState, useEffect } from 'react'

import { Row, Col } from 'antd'

import WalletCreate from '../../components/wallet/WalletCreate'
import WalleteManage from '../../components/wallet/WalletManage'

const UserAccountsScreen: React.FC = (): JSX.Element => {
  const keystore = localStorage.getItem('keystore')
  const [isWallet, setIsWallet] = useState(!!keystore)
  useEffect(() => {
    if (localStorage.getItem('keystore')) {
      setIsWallet(true)
    }
  }, [isWallet])
  return (
    <Row>
      <Col span={24}>{isWallet ? <WalleteManage /> : <WalletCreate />}</Col>
    </Row>
  )
}

export default UserAccountsScreen

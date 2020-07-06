import React, { useEffect, useState } from 'react'

import { CopyOutlined } from '@ant-design/icons'
import { Row, Col, Typography, Card, Button } from 'antd'
import QRCode from 'qrcode'

import AccountSelector from './AccountSelector'

const { Title, Text } = Typography

// Dummmy data
const UserAccount = {
  address: 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y',
  locked: false,
  pwHash: '$2a$08$7p6Z3OwF7HuQdHoL3PnP8.0tgkkYZ5vl4XYv/ZkmhB9Jy7gT1GPuq',
  _id: 'MTbyhYhWysp25TDBy'
}

const Receive: React.FC = (): JSX.Element => {
  const [copyMsg, setCopyMsg] = useState<string>('')
  const [timer, setTimer] = useState<number | null>(null)
  const [account, setAccount] = useState<string>()
  const userAccount = () => {
    // Placeholder
    return UserAccount
  }
  // This will be reactive when reactive datasource is added
  /*eslint-disable */
  useEffect(() => {
    const address = userAccount().address
    QRCode.toCanvas(address, { errorCorrectionLevel: 'H', scale: 6 }, function (err, canvas) {
      if (err) throw err
      const container = document.getElementById('qr-container')
      container?.appendChild(canvas)
    })
  }, [UserAccount])
  /*eslint-enable */
  useEffect(() => {
    // Cleanup timer on 'unmount'
    return function cleanup() {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [timer])

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(userAccount().address)
    setCopyMsg('Address copied..')
    if (timer) {
      clearTimeout(timer)
    }
    const tmr = setTimeout(() => {
      setCopyMsg('')
    }, 3000)
    setTimer(tmr)
  }

  return (
    <Row>
      <Col sm={{ span: 24 }} md={{ span: 16, offset: 4 }} lg={{ span: 14, offset: 5 }}>
        <Title level={3} style={{ textAlign: 'center' }}>
          Receive Funds To: {account}
        </Title>
        <AccountSelector onChange={(s: string) => setAccount(s)} />
        <Card bordered={false}>
          <div style={{ display: 'flex', justifyContent: 'center' }} id="qr-container"></div>
        </Card>
      </Col>
      <Col sm={{ span: 24 }} md={{ span: 16, offset: 4 }} lg={{ span: 14, offset: 5 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label htmlFor="clipboard-btn">
            <Title level={4} ellipsis code>
              {userAccount().address}
            </Title>
          </label>
          <Button type="primary" size="large" onClick={handleCopyAddress}>
            Copy&nbsp;
            <CopyOutlined />
          </Button>
          <Text type="secondary">{copyMsg}</Text>
        </div>
      </Col>
    </Row>
  )
}

export default Receive

import React, { useEffect, useState } from 'react'
import Clipboard from 'clipboard'
import QRCode from 'qrcode'
import { Row, Col, Typography, Card, Button } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
const { Title, Text } = Typography

// Dummmy data
const UserAccount = {
  address: 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y',
  locked: false,
  pwHash: '$2a$08$7p6Z3OwF7HuQdHoL3PnP8.0tgkkYZ5vl4XYv/ZkmhB9Jy7gT1GPuq',
  _id: 'MTbyhYhWysp25TDBy'
}

const RecieveFundsView: React.FC = (): JSX.Element => {
  const [copyMsg, setCopyMsg] = useState<string>('')
  const userAccount = () => {
    // Placeholder
    return UserAccount
  }
  useEffect(() => {
    const address = userAccount().address
    QRCode.toCanvas(address, { errorCorrectionLevel: 'H', scale: 6 }, function (err, canvas) {
      if (err) throw err
      const container = document.getElementById('qr-container')
      container?.appendChild(canvas)
    })
    const clipboard = new Clipboard('#clipboard-btn')
    let timer: number | null = null
    clipboard.on('success', (e: Clipboard.Event) => {
      if (timer !== null) {
        clearTimeout(timer)
        timer = null
        setCopyMsg('')
      }
      setCopyMsg('Address copied...')
      timer = setTimeout(() => {
        setCopyMsg('')
      }, 3000)
      e.clearSelection()
    })

    clipboard.on('error', function (e: Clipboard.Event) {
      // Verbose logging since an extreme edge case(?)
      console.log('error copying to clipboard')
      console.error('Action:', e.action)
      console.error('Trigger:', e.trigger)
    })
  }, [])

  return (
    <Row>
      <Col sm={{ span: 24 }} md={{ span: 16, offset: 4 }} lg={{ span: 14, offset: 5 }} xl={{ span: 9, offset: 0 }}>
        <Title level={3} style={{ textAlign: 'center' }}>
          Receive Funds
        </Title>
        <Card bordered={false}>
          <div style={{ display: 'flex', justifyContent: 'center' }} id="qr-container"></div>
        </Card>
      </Col>
      <Col sm={{ span: 24 }} md={{ span: 16, offset: 4 }} lg={{ span: 14, offset: 5 }} xl={{ span: 9, offset: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label htmlFor="clipboard-btn">
            <Title level={4} ellipsis code>
              {userAccount().address}
            </Title>
          </label>
          <Button id="clipboard-btn" type="primary" size="large" data-clipboard-text={userAccount().address}>
            Copy&nbsp;
            <CopyOutlined />
          </Button>
          <Text type="secondary">{copyMsg}</Text>
        </div>
      </Col>
    </Row>
  )
}

export default RecieveFundsView

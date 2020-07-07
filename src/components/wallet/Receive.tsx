import React, { useCallback, useEffect, useState } from 'react'

import { LeftOutlined } from '@ant-design/icons'
import { Row, Col } from 'antd'
import QRCode from 'qrcode'
import { useHistory } from 'react-router-dom'

import AccountSelector from './AccountSelector'
import { StyledBackLabel, StyledCol, StyledCard, StyledDiv, StyledAddress, StyledLabel } from './Receive.style'

// Dummmy data
const UserAccount = {
  address: 'tbnb1vxutrxadm0utajduxfr6wd9kqfalv0dg2wnx5y',
  locked: false,
  pwHash: '$2a$08$7p6Z3OwF7HuQdHoL3PnP8.0tgkkYZ5vl4XYv/ZkmhB9Jy7gT1GPuq',
  _id: 'MTbyhYhWysp25TDBy'
}

const Receive: React.FC = (): JSX.Element => {
  const history = useHistory()
  const [copyMsg, setCopyMsg] = useState<string>('')
  const [timer, setTimer] = useState<number | null>(null)

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

  const handleCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(userAccount().address)
    setCopyMsg('Address copied..')
    if (timer) {
      clearTimeout(timer)
    }
    const tmr = setTimeout(() => {
      setCopyMsg('')
    }, 3000)
    setTimer(tmr)
  }, [timer])

  const onBack = useCallback(() => {
    history.goBack()
  }, [history])

  return (
    <>
      <Row>
        <Col span={24}>
          <StyledBackLabel size="large" color="primary" weight="bold" onClick={onBack}>
            <LeftOutlined />
            <span>Back</span>
          </StyledBackLabel>
        </Col>
      </Row>
      <Row>
        <StyledCol span={24}>
          <AccountSelector />
          <StyledCard bordered={false}>
            <div id="qr-container" />
          </StyledCard>
          <StyledDiv>
            <label htmlFor="clipboard-btn">
              <StyledAddress size="large">{userAccount().address}</StyledAddress>
            </label>
            <StyledLabel size="big" onClick={handleCopyAddress}>
              Copy
            </StyledLabel>
            <StyledAddress size="big">{copyMsg}</StyledAddress>
          </StyledDiv>
        </StyledCol>
      </Row>
    </>
  )
}

export default Receive

import React from 'react'

import { Row, Col, Typography, Table } from 'antd'
const { Title } = Typography

const UserAssets:any = [
  { _id: '1', free: '99', frozen: '11', locked: '21', symbol: 'BNB-JST' },
  { _id: '2', free: '1034', frozen: '38', locked: '101', symbol: 'RUN-1E0' }
]

export default function UserStakesScreen (): JSX.Element {
  return (
    <Row>
      <Col span={24}>
        <Title level={4}>User Stakes</Title>
      </Col>
    </Row>
  )
}

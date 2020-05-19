import React from 'react'
import AccountSelector from '../../components/wallet/AccountSelector'
import { Row, Col, Form, Input, Button, Typography } from 'antd'
import { Store } from 'antd/lib/form/interface'
const { Title } = Typography

const FundsSendScreen: React.FC = (): JSX.Element => {
  const onSubmit = (data: Store) => {
    console.log(data)
  }
  return (
    <Row>
      <Col sm={{ span: 24 }} md={{ span: 16, offset: 4 }} lg={{ span: 12, offset: 6 }}>
        <Title level={4}>Send Funds</Title>
        <AccountSelector />
        <Form onFinish={onSubmit} labelCol={{ span: 24 }}>
          <Form.Item name="recipient" label="recipient">
            <Input size="large" />
          </Form.Item>
          <Form.Item name="amount" label="amount">
            <Input size="large" />
          </Form.Item>
          <Form.Item name="password" label="password">
            <Input type="password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
}

export default FundsSendScreen

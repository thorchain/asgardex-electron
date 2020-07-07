import React, { useCallback } from 'react'

import { LeftOutlined } from '@ant-design/icons'
import { Row, Col, Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import Button from '../../components/uielements/button'
import Input from '../../components/uielements/input'
import AccountSelector from './AccountSelector'
import {
  StyledCol,
  StyledForm,
  StyledSubForm,
  StyledFormItem,
  StyledSubmitItem,
  StyledLabel,
  CustomLabel,
  StyledBackLabel
} from './Send.style'

const Send: React.FC = (): JSX.Element => {
  const intl = useIntl()
  const history = useHistory()

  const onSubmit = (data: Store) => {
    console.log(data)
  }

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
          <StyledForm onFinish={onSubmit} labelCol={{ span: 24 }}>
            <StyledSubForm>
              <CustomLabel size="big">{intl.formatMessage({ id: 'common.address' })}</CustomLabel>
              <Form.Item name="recipient">
                <Input color="primary" sizevalue="big" />
              </Form.Item>
              <CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</CustomLabel>
              <StyledFormItem name="amount">
                <Input sizevalue="big" />
              </StyledFormItem>
              <StyledLabel size="big">MAX 35.3 BNB</StyledLabel>
              <CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</CustomLabel>
              <Form.Item name="password">
                <Input sizevalue="big" />
              </Form.Item>
            </StyledSubForm>
            <StyledSubmitItem>
              <Button type="primary" htmlType="submit" round="true" sizevalue="xnormal">
                Send
              </Button>
            </StyledSubmitItem>
          </StyledForm>
        </StyledCol>
      </Row>
    </>
  )
}

export default Send

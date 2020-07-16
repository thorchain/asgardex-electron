import React, { useCallback } from 'react'

import { LeftOutlined } from '@ant-design/icons'
import { Row, Col, Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { ASSETS_MAINNET } from '../../../shared/mock/assets'
import Button from '../uielements/button'
import { Input } from '../uielements/input'
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
          {/* AccountSelector needs data - we are using mock data for now */}
          <AccountSelector asset={ASSETS_MAINNET.BOLT} assets={[ASSETS_MAINNET.BNB, ASSETS_MAINNET.TOMO]} />
          <StyledForm onFinish={onSubmit} labelCol={{ span: 24 }}>
            <StyledSubForm>
              <CustomLabel size="big">{intl.formatMessage({ id: 'common.address' })}</CustomLabel>
              <Form.Item name="recipient">
                <Input color="primary" size="large" />
              </Form.Item>
              <CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</CustomLabel>
              <StyledFormItem name="amount">
                <Input size="large" />
              </StyledFormItem>
              <StyledLabel size="big">MAX 35.3 BNB</StyledLabel>
              <CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</CustomLabel>
              <Form.Item name="password">
                <Input size="large" />
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

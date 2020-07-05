import React from 'react'

import { Row, Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { useIntl } from 'react-intl'

import Button from '../../components/uielements/button'
import Input from '../../components/uielements/input'
import Label from '../../components/uielements/label'
import AccountSelector from './AccountSelector'
import { StyledCol, StyledForm, StyledSubForm, StyledFormItem, StyledSubmitItem, StyledLabel } from './Send.style'

const Send: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const onSubmit = (data: Store) => {
    console.log(data)
  }

  return (
    <Row>
      <StyledCol span={24}>
        <AccountSelector />
        <StyledForm onFinish={onSubmit} labelCol={{ span: 24 }}>
          <StyledSubForm>
            <Label color="gray" size="big" textTransform="uppercase">
              {intl.formatMessage({ id: 'common.address' })}
            </Label>
            <Form.Item name="recipient">
              <Input sizevalue="big" />
            </Form.Item>
            <Label color="gray" size="big" textTransform="uppercase">
              {intl.formatMessage({ id: 'common.amount' })}
            </Label>
            <StyledFormItem name="amount">
              <Input sizevalue="big" />
            </StyledFormItem>
            <StyledLabel size="big" color="primary" textTransform="uppercase">
              MAX 35.3 BNB
            </StyledLabel>
            <Label color="gray" size="big" textTransform="uppercase">
              {intl.formatMessage({ id: 'common.memo' })}
            </Label>
            <Form.Item name="password">
              <Input sizevalue="big" />
            </Form.Item>
          </StyledSubForm>
          <StyledSubmitItem>
            <Button type="primary" htmlType="submit" round="true" sizevalue="xnormal">
              Submit
            </Button>
          </StyledSubmitItem>
        </StyledForm>
      </StyledCol>
    </Row>
  )
}

export default Send

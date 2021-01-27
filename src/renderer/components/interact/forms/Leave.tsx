import React, { useCallback } from 'react'

import { getLeaveMemo } from '@thorchain/asgardex-util'
import { Form } from 'antd'
import { useIntl } from 'react-intl'

import { Input } from '../../uielements/input'
import * as Styled from './Forms.styles'

type FormValues = { thorAddress: string; isLoading?: boolean; loadingProgress?: string }

type Props = {
  onFinish: (leaveData: { memo: string }) => void
  isLoading?: boolean
  loadingProgress?: string
}
export const Leave: React.FC<Props> = ({ onFinish: onFinishProp, isLoading = false, loadingProgress }) => {
  const intl = useIntl()
  const [form] = Form.useForm<FormValues>()

  const onFinish = useCallback(
    ({ thorAddress }: FormValues) => {
      onFinishProp({
        memo: getLeaveMemo(thorAddress)
      })
    },
    [onFinishProp]
  )

  return (
    <Styled.Form form={form} onFinish={onFinish} initialValues={{ thorAddress: '' }}>
      <div>
        <Styled.InputContainer>
          <Styled.InputLabel>{intl.formatMessage({ id: 'common.thorAddress' })}</Styled.InputLabel>
          <Form.Item
            name="thorAddress"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'wallet.validations.shouldNotBeEmpty' })
              }
            ]}>
            <Input disabled={isLoading} size="large" />
          </Form.Item>
        </Styled.InputContainer>
      </div>

      <Styled.SubmitButtonContainer>
        {() => (
          <>
            {loadingProgress && <Styled.LoadingProgress>{loadingProgress}</Styled.LoadingProgress>}
            <Styled.SubmitButton
              loading={isLoading}
              disabled={isLoading || !!form.getFieldsError().filter(({ errors }) => errors.length).length}
              htmlType="submit">
              {intl.formatMessage({ id: 'wallet.action.send' })}
            </Styled.SubmitButton>
          </>
        )}
      </Styled.SubmitButtonContainer>
    </Styled.Form>
  )
}

import React, { useCallback } from 'react'

import { getLeaveMemo } from '@thorchain/asgardex-util'
import { Form } from 'antd'
import { useIntl } from 'react-intl'

import { Input } from '../../uielements/input'
import * as Styled from './Forms.styles'

const memoPlaceholder = getLeaveMemo('THORADDRESS')

type FormValues = { memo: string; isLoading?: boolean; loadingProgress?: string }

type Props = {
  onFinish: (leaveData: { memo: string }) => void
  isLoading?: boolean
  loadingProgress?: string
}
export const Leave: React.FC<Props> = ({ onFinish: onFinishProp, isLoading = false, loadingProgress }) => {
  const intl = useIntl()
  const [form] = Form.useForm<FormValues>()

  const onFinish = useCallback(
    ({ memo }: FormValues) => {
      onFinishProp({
        memo
      })
    },
    [onFinishProp]
  )

  return (
    <Styled.Form form={form} onFinish={onFinish} initialValues={{ memo: memoPlaceholder }}>
      <div>
        <Styled.InputContainer>
          <Styled.InputLabel>{intl.formatMessage({ id: 'common.memo' })}</Styled.InputLabel>
          <Form.Item
            name="memo"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'wallet.validations.shouldNotBeEmpty' })
              }
            ]}>
            <Input disabled={isLoading} size="large" placeholder={memoPlaceholder} />
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

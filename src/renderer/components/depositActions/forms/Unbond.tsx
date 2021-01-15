import React, { useCallback } from 'react'

import { Form } from 'antd'
import { useIntl } from 'react-intl'

import { Input } from '../../uielements/input'
import * as Styled from './Forms.styles'

const getUnbondMemo = (thorAddress: string) => `UNBOND:${thorAddress}:UNITS`

const memoPlaceholder = getUnbondMemo('THORADDRESS')

type FormValues = { memo: string }

type Props = {
  onFinish: (unboundData: { memo: string }) => void
}
export const Unbond: React.FC<Props> = ({ onFinish: onFinishProp }) => {
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
    <Styled.Form
      form={form}
      /**
       * typescast here caused by TS can not infer "any" type from onFinish cb and gives unknown here
       */
      onFinish={(data) => onFinish(data as FormValues)}
      initialValues={{ memo: memoPlaceholder }}>
      <div>
        <Styled.InputContainer>
          <Styled.InputLabel>memo</Styled.InputLabel>
          <Styled.Form.Item
            name="memo"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'common.validations.shouldNotBeEmpty' })
              }
            ]}>
            <Input size="large" placeholder={memoPlaceholder} />
          </Styled.Form.Item>
        </Styled.InputContainer>
      </div>

      <Styled.SubmitButton
        disabled={!!form.getFieldsError().filter(({ errors }) => errors.length).length}
        htmlType="submit">
        {intl.formatMessage({ id: 'wallet.action.send' })}
      </Styled.SubmitButton>
    </Styled.Form>
  )
}

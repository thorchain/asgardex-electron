import React, { useCallback } from 'react'

import { assetAmount, assetToBase, BaseAmount } from '@xchainjs/xchain-util'
import { Form } from 'antd'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { Input, InputBigNumber } from '../../uielements/input'
import * as Styled from './Forms.styles'

const getBondMemo = (thorAddress: string) => `BOND:${thorAddress}`

const bondMemoPlaceholder = getBondMemo('THORADDRESS')

type FormValues = { memo: string; amount: BigNumber }

type Props = {
  onFinish: (boundData: { memo: string; amount: BaseAmount }) => void
}
export const Bond: React.FC<Props> = ({ onFinish: onFinishProp }) => {
  const intl = useIntl()
  const [form] = Form.useForm<FormValues>()

  const onFinish = useCallback(
    ({ memo, amount }: FormValues) => {
      onFinishProp({
        memo,
        amount: assetToBase(assetAmount(amount))
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
      initialValues={{ memo: bondMemoPlaceholder }}>
      <div>
        <Styled.InputContainer>
          <Styled.InputLabel>memo</Styled.InputLabel>
          <Styled.Form.Item
            name="memo"
            rules={[
              {
                required: true,
                message: 'memo is required'
              }
            ]}>
            <Input size="large" placeholder={bondMemoPlaceholder} />
          </Styled.Form.Item>
        </Styled.InputContainer>

        <Styled.InputContainer>
          <Styled.InputLabel>amount</Styled.InputLabel>
          <Styled.Form.Item name="amount">
            <InputBigNumber size="large" placeholder={bondMemoPlaceholder} decimal={4} />
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

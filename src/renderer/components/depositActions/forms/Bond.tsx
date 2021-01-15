import React, { useCallback } from 'react'

import {
  AssetAmount,
  assetAmount,
  AssetRuneNative,
  assetToBase,
  BaseAmount,
  formatAssetAmount,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
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
  max: AssetAmount
}
export const Bond: React.FC<Props> = ({ onFinish: onFinishProp, max }) => {
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

  const amountValidator = useCallback(
    (_, value: string, cb: (error?: string) => void) => {
      const numberValue = Number(value)
      if (numberValue <= 0 || Number.isNaN(numberValue)) {
        cb(intl.formatMessage({ id: 'common.validations.graterThen' }, { value: 0 }))
      }
      if (max.amount().isLessThan(Number(value))) {
        cb(
          intl.formatMessage(
            { id: 'common.validations.lessThen' },
            { value: formatAssetAmount({ amount: max, decimal: 2, trimZeros: true }) }
          )
        )
      } else {
        cb()
      }
    },
    [max, intl]
  )
  console.log(form.getFieldsError())
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
                message: intl.formatMessage({ id: 'common.validations.shouldNotBeEmpty' })
              }
            ]}>
            <Input size="large" placeholder={bondMemoPlaceholder} />
          </Styled.Form.Item>
        </Styled.InputContainer>

        <Styled.InputContainer>
          <Styled.InputLabel>amount</Styled.InputLabel>
          <Styled.Form.Item
            name="amount"
            rules={[
              {
                validator: amountValidator
              }
            ]}>
            <InputBigNumber size="large" decimal={4} />
          </Styled.Form.Item>
          <Styled.MaxValue>
            max {formatAssetAmountCurrency({ amount: max, decimal: 2, asset: AssetRuneNative, trimZeros: true })}
          </Styled.MaxValue>
        </Styled.InputContainer>
      </div>

      <Styled.SubmitButtonContainer>
        {() => (
          <Styled.SubmitButton
            disabled={!!form.getFieldsError().filter(({ errors }) => errors.length).length}
            htmlType="submit">
            {intl.formatMessage({ id: 'wallet.action.send' })}
          </Styled.SubmitButton>
        )}
      </Styled.SubmitButtonContainer>
    </Styled.Form>
  )
}

import React, { useCallback } from 'react'

import { getBondMemo } from '@thorchain/asgardex-util'
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

const bondMemoPlaceholder = getBondMemo('THORADDRESS')

type FormValues = { memo: string; amount: BigNumber }

type Props = {
  onFinish: (boundData: { memo: string; amount: BaseAmount }) => void
  max: AssetAmount
  isLoading?: boolean
  loadingProgress?: string
}
export const Bond: React.FC<Props> = ({ onFinish: onFinishProp, max, isLoading = false, loadingProgress }) => {
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
        cb(intl.formatMessage({ id: 'wallet.validations.graterThen' }, { value: 0 }))
      }
      if (max.amount().isLessThan(Number(value))) {
        cb(
          intl.formatMessage(
            { id: 'wallet.validations.lessThen' },
            { value: formatAssetAmount({ amount: max, decimal: 8, trimZeros: true }) }
          )
        )
      } else {
        cb()
      }
    },
    [max, intl]
  )

  return (
    <Styled.Form form={form} onFinish={onFinish} initialValues={{ memo: bondMemoPlaceholder }}>
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
            <Input disabled={isLoading} size="large" placeholder={bondMemoPlaceholder} />
          </Form.Item>
        </Styled.InputContainer>

        <Styled.InputContainer>
          <Styled.InputLabel>{intl.formatMessage({ id: 'common.amount' })}</Styled.InputLabel>
          <Form.Item
            name="amount"
            rules={[
              {
                validator: amountValidator
              }
            ]}>
            <InputBigNumber disabled={isLoading} size="large" decimal={4} />
          </Form.Item>
          <Styled.MaxValue>
            {intl.formatMessage({ id: 'common.max' })}{' '}
            {formatAssetAmountCurrency({ amount: max, decimal: 8, asset: AssetRuneNative, trimZeros: true })}
          </Styled.MaxValue>
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

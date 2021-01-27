import React, { useCallback } from 'react'

import { getUnbondMemo } from '@thorchain/asgardex-util'
import { assetAmount, assetToBase, bnOrZero } from '@xchainjs/xchain-util'
import { Form } from 'antd'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { Input, InputBigNumber } from '../../uielements/input'
import { validateTxAmountInput } from '../../wallet/txs/TxForm.util'
import * as Styled from './Forms.styles'

type FormValues = { thorAddress: string; amount: BigNumber }

type Props = {
  onFinish: (unboundData: { memo: string }) => void
  isLoading?: boolean
  loadingProgress?: string
}
export const Unbond: React.FC<Props> = ({ onFinish: onFinishProp, isLoading = false, loadingProgress }) => {
  const intl = useIntl()
  const [form] = Form.useForm<FormValues>()

  const onFinish = useCallback(
    ({ thorAddress, amount }: FormValues) => {
      onFinishProp({
        memo: getUnbondMemo(thorAddress, assetToBase(assetAmount(amount)))
      })
    },
    [onFinishProp]
  )

  const amountValidator = useCallback(
    (_, value: string) => {
      return validateTxAmountInput({
        input: bnOrZero(value),
        // User inputs his THOR-node address manually and we dont know how much he has bounded
        maxAmount: assetAmount(Number.POSITIVE_INFINITY),
        errors: {
          // We have InputBigNumber beneath and it allows input only of BN
          msg1: '',
          msg2: intl.formatMessage({ id: 'wallet.validations.graterThen' }, { value: 0 }),
          // As max value is Number.POSITIVE_INFINITY no need to pass this
          msg3: ''
        }
      })
    },
    [intl]
  )

  return (
    <Styled.Form form={form} onFinish={onFinish} initialValues={{ memo: '' }}>
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

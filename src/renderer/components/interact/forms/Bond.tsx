import React, { useCallback } from 'react'

import { getBondMemo } from '@thorchain/asgardex-util'
import {
  AssetAmount,
  assetAmount,
  AssetRuneNative,
  assetToBase,
  BaseAmount,
  bnOrZero,
  formatAssetAmount,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
import { Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { ZERO_BN } from '../../../const'
import { greaterThan, lessThanOrEqualTo } from '../../../helpers/form/validation'
import { Input, InputBigNumber } from '../../uielements/input'
import * as Styled from './Forms.styles'

type FormValues = { thorAddress: string; amount: BigNumber }

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
    ({ thorAddress, amount }: FormValues) => {
      onFinishProp({
        memo: getBondMemo(thorAddress),
        amount: assetToBase(assetAmount(amount))
      })
    },
    [onFinishProp]
  )

  // graterThan returns pure function and there is no need to validate its deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const graterThenZero = useCallback(
    greaterThan(ZERO_BN)(intl.formatMessage({ id: 'wallet.validations.graterThen' }, { value: 0 })),
    [intl]
  )

  // lessThanOrEqualTo returns pure function and there is no need to validate its deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lessOrEqualToMax = useCallback(
    lessThanOrEqualTo(max.amount())(
      intl.formatMessage(
        { id: 'wallet.validations.lessThen' },
        { value: formatAssetAmount({ amount: max, decimal: 8, trimZeros: true }) }
      )
    ),
    [max, intl]
  )

  const amountValidator = useCallback(
    (_, value: string) => {
      return FP.pipe(
        bnOrZero(value),
        lessOrEqualToMax,
        E.chain(graterThenZero),
        E.fold(
          (e) => Promise.reject(e),
          () => Promise.resolve()
        )
      )
    },
    [graterThenZero, lessOrEqualToMax]
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

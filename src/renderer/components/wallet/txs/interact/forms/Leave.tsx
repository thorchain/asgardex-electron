import React, { useCallback } from 'react'

import { getLeaveMemo } from '@thorchain/asgardex-util'
import { Form } from 'antd'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { validateAddress } from '../../../../../helpers/form/validation'
import { AddressValidation } from '../../../../../services/clients'
import { Input } from '../../../../uielements/input'
import * as Styled from './Forms.styles'

type FormValues = { thorAddress: string; isLoading?: boolean; loadingProgress?: string }

type Props = {
  onFinish: (leaveData: { memo: string }) => void
  isLoading?: boolean
  loadingProgress?: string
  addressValidation: AddressValidation
}
export const Leave: React.FC<Props> = ({
  onFinish: onFinishProp,
  isLoading = false,
  loadingProgress,
  addressValidation
}) => {
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

  const addressValidator = useCallback(
    (_, value: string) =>
      FP.pipe(
        value,
        validateAddress(
          addressValidation,
          intl.formatMessage({ id: 'wallet.validations.shouldNotBeEmpty' }),
          intl.formatMessage({ id: 'wallet.errors.address.invalid' })
        ),
        E.fold(
          (e) => Promise.reject(e),
          () => Promise.resolve()
        )
      ),
    [addressValidation, intl]
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
                validator: addressValidator
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

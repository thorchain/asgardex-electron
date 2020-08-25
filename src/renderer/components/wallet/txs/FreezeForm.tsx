import React, { useCallback, useMemo } from 'react'

import { bn, assetAmount, assetToString, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { Row, Form } from 'antd'
import { useIntl } from 'react-intl'

import { AssetWithBalance, FreezeAction, FreezeTxParams } from '../../../services/binance/types'
import { InputNumber } from '../../uielements/input'
import AccountSelector from '../AccountSelector'
import * as Styled from './Form.style'

export type FormValues = {
  amount: string
}

type Props = {
  freezeAction: FreezeAction
  asset: AssetWithBalance
  onSubmit: ({ amount, asset, action }: FreezeTxParams) => void
  isLoading: boolean
}

export const FreezeForm: React.FC<Props> = (props): JSX.Element => {
  const { freezeAction, onSubmit: onSubmitProp, asset: assetWB, isLoading = false } = props

  const intl = useIntl()

  const [form] = Form.useForm<FormValues>()

  const maxAmount = useMemo(() => {
    if (freezeAction === 'unfreeze') {
      return assetWB.frozenBalance || assetAmount(0)
    }
    return assetWB.balance
  }, [assetWB, freezeAction])

  const amountValidator = useCallback(
    async (a: unknown, stringValue: string) => {
      const value = bn(stringValue)

      // TODO(Veado): Consider fees (https://github.com/thorchain/asgardex-electron/issues/369)
      if (!value.isGreaterThan(0)) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }))
      }

      if (value.isGreaterThan(maxAmount.amount())) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' }))
      }
    },
    [maxAmount, intl]
  )

  const onSubmit = useCallback(
    ({ amount }: FormValues) => {
      onSubmitProp({ amount: assetAmount(amount), asset: assetWB.asset, action: freezeAction })
    },
    [onSubmitProp, assetWB, freezeAction]
  )

  const submitLabel = useMemo(() => {
    switch (freezeAction) {
      case 'freeze':
        return intl.formatMessage({ id: 'wallet.action.freeze' })
      case 'unfreeze':
        return intl.formatMessage({ id: 'wallet.action.unfreeze' })
      default:
        return ''
    }
  }, [intl, freezeAction])

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector selectedAsset={assetWB.asset} assets={[assetWB]} />
        {/* `Form<FormValue>` does not work in `styled(Form)`, so we have to add styles here. All is just needed to have correct types in `onFinish` handler)  */}
        <Form form={form} onFinish={onSubmit} labelCol={{ span: 24 }} style={{ padding: '30px' }}>
          <Styled.SubForm>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
            <Styled.FormItem
              rules={[
                {
                  required: true,
                  validator: amountValidator
                }
              ]}
              name="amount">
              <InputNumber min={0} size="large" disabled={isLoading} />
            </Styled.FormItem>
            <Styled.StyledLabel size="big">
              MAX: {formatAssetAmountCurrency(maxAmount, assetToString(assetWB.asset))}
            </Styled.StyledLabel>
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button loading={isLoading} htmlType="submit">
              {submitLabel}
            </Styled.Button>
          </Styled.SubmitItem>
        </Form>
      </Styled.Col>
    </Row>
  )
}

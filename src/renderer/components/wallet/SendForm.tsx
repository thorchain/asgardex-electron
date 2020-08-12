import React, { useCallback, useState, useMemo } from 'react'

import { bn, formatAssetAmount, assetAmount } from '@thorchain/asgardex-util'
import { Row, Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { useIntl } from 'react-intl'

import { EMTPY_ASSET_WITH_BALANCE } from '../../helpers/assetHelper'
import { AssetWithBalance } from '../../types/asgardex'
import { Input, InputNumber } from '../uielements/input'
import AccountSelector from './AccountSelector'
import * as Styled from './Send.style'
import { SendAction } from './types'

type SendFormProps = {
  sendAction: SendAction
  balances?: AssetWithBalance[]
  initialActiveAsset: O.Option<AssetWithBalance>
  onSubmit: (recipient: string, amount: number, symbol: string, password?: string) => void
}

export const SendForm: React.FC<SendFormProps> = ({
  sendAction,
  onSubmit: onSubmitProp,
  balances = [],
  initialActiveAsset = O.none
}): JSX.Element => {
  const intl = useIntl()
  const [activeAsset, setActiveAsset] = useState<AssetWithBalance>(
    pipe(
      initialActiveAsset,
      O.getOrElse(() => EMTPY_ASSET_WITH_BALANCE)
    )
  )

  const [form] = Styled.Form.useForm()

  const addressValidator = useCallback(
    async (_: unknown, value: string) => {
      if (!value || value.length < 8) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.address.length' }))
      }
    },
    [intl]
  )

  const maxAmount = useMemo(() => {
    if (sendAction === 'unfreeze') {
      return activeAsset.frozenBalance || assetAmount(0)
    }
    return activeAsset.balance
  }, [activeAsset, sendAction])

  const amountValidator = useCallback(
    async (_: unknown, stringValue: string) => {
      const value = bn(stringValue)
      if (Number.isNaN(value)) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.amount.shouldBeNumber' }))
      }

      if (!value.isGreaterThan(0)) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.amount.shouldBePositive' }))
      }

      if (value.isGreaterThan(maxAmount.amount())) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.amount.shouldBeLessThatBalance' }))
      }
    },
    [maxAmount, intl]
  )

  const onSubmit = useCallback(
    (data: Store) => {
      onSubmitProp(data.recipient, data.amount, activeAsset.asset.symbol, data.password)
    },
    [onSubmitProp, activeAsset]
  )

  const submitLabel = useMemo(() => {
    switch (sendAction) {
      case 'send':
        return intl.formatMessage({ id: 'wallet.action.send' })
      case 'freeze':
        return intl.formatMessage({ id: 'wallet.action.freeze' })
      case 'unfreeze':
        return intl.formatMessage({ id: 'wallet.action.unfreeze' })
      default:
        return ''
    }
  }, [intl, sendAction])

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector onChange={setActiveAsset} selectedAsset={activeAsset.asset} assets={balances} />
        <Styled.Form form={form} onFinish={onSubmit} labelCol={{ span: 24 }}>
          <Styled.SubForm>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.address' })}</Styled.CustomLabel>
            <Form.Item rules={[{ required: true, validator: addressValidator }]} name="recipient">
              <Input color="primary" size="large" />
            </Form.Item>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
            <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
              <InputNumber min={0} size="large" />
            </Styled.FormItem>
            <Styled.StyledLabel size="big">MAX: {formatAssetAmount(maxAmount)}</Styled.StyledLabel>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
            <Form.Item name="password">
              <Input size="large" />
            </Form.Item>
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button htmlType="submit">{submitLabel}</Styled.Button>
          </Styled.SubmitItem>
        </Styled.Form>
      </Styled.Col>
    </Row>
  )
}

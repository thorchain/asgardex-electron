import React, { useCallback, useState } from 'react'

import { bn } from '@thorchain/asgardex-util'
import { Row, Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { useIntl } from 'react-intl'

import { ASSETS_MAINNET } from '../../../shared/mock/assets'
import { AssetWithBalance } from '../../types/asgardex'
import { Input, InputNumber } from '../uielements/input'
import AccountSelector from './AccountSelector'
import * as Styled from './Send.style'

type SendFormProps = {
  balances?: AssetWithBalance[]
  initialActiveAsset?: O.Option<AssetWithBalance>
  onSubmit: (recipient: string, amount: number, symbol: string, password?: string) => void
}

export const SendForm: React.FC<SendFormProps> = ({
  onSubmit: onSubmitProp,
  balances = [],
  initialActiveAsset = O.none
}): JSX.Element => {
  const intl = useIntl()
  const [activeAsset, setActiveAsset] = useState<AssetWithBalance>(
    pipe(
      initialActiveAsset,
      O.getOrElse(() => ({ ...ASSETS_MAINNET.BOLT, balance: bn(0) }))
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

  const amountValidator = useCallback(
    async (_: unknown, stringValue: string) => {
      const value = bn(stringValue)
      if (Number.isNaN(value)) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.amount.shouldBeNumber' }))
      }

      if (!value.isGreaterThan(0)) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.amount.shouldBePositive' }))
      }

      if (value.isGreaterThan(activeAsset.balance)) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.amount.shouldBeLessThatBalance' }))
      }
    },
    [intl, activeAsset]
  )

  const onSubmit = useCallback(
    (data: Store) => {
      onSubmitProp(data.recipient, data.amount, activeAsset.symbol, data.password)
    },
    [onSubmitProp, activeAsset]
  )

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector onChange={setActiveAsset} asset={activeAsset} assets={balances} />
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
            <Styled.StyledLabel size="big">MAX: {activeAsset.balance.toFormat()}</Styled.StyledLabel>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
            <Form.Item name="password">
              <Input size="large" />
            </Form.Item>
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button htmlType="submit">{intl.formatMessage({ id: 'wallet.action.send' })}</Styled.Button>
          </Styled.SubmitItem>
        </Styled.Form>
      </Styled.Col>
    </Row>
  )
}

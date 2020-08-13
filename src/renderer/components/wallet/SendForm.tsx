import React, { useCallback, useMemo } from 'react'

import { bn, assetAmount, assetToString, Asset, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { Row, Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import * as walletRoutes from '../../routes/wallet'
import { AssetsWithBalance, AssetWithBalance } from '../../services/binance/types'
import { Input, InputNumber } from '../uielements/input'
import AccountSelector from './AccountSelector'
import * as Styled from './Send.style'
import { SendAction } from './types'

type SendFormProps = {
  sendAction: SendAction
  assets?: AssetsWithBalance
  asset: AssetWithBalance
  onSubmit: (recipient: string, amount: number, symbol: string, password?: string) => void
}

export const SendForm: React.FC<SendFormProps> = ({
  sendAction,
  onSubmit: onSubmitProp,
  assets = [],
  asset: assetWB
}): JSX.Element => {
  const intl = useIntl()
  const history = useHistory()

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
      return assetWB.frozenBalance || assetAmount(0)
    }
    return assetWB.balance
  }, [assetWB, sendAction])

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
      onSubmitProp(data.recipient, data.amount, assetWB.asset.symbol, data.password)
    },
    [onSubmitProp, assetWB]
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

  const changeSelectorHandler = (asset: Asset) => {
    const path = walletRoutes.send.path({ asset: assetToString(asset) })
    history.push(path)
  }

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector onChange={changeSelectorHandler} selectedAsset={assetWB.asset} assets={assets} />
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
            <Styled.StyledLabel size="big">
              MAX: {formatAssetAmountCurrency(maxAmount, assetToString(assetWB.asset))}
            </Styled.StyledLabel>
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

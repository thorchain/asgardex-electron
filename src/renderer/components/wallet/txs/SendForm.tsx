import React, { useCallback } from 'react'

import { Address } from '@thorchain/asgardex-binance'
import { bn, assetToString, Asset, formatAssetAmountCurrency, AssetAmount, assetAmount } from '@thorchain/asgardex-util'
import { Row, Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import * as walletRoutes from '../../../routes/wallet'
import { AssetsWithBalance, AssetWithBalance } from '../../../services/binance/types'
import { Input, InputNumber } from '../../uielements/input'
import AccountSelector from './../AccountSelector'
import * as Styled from './Form.style'

type Props = {
  assets?: AssetsWithBalance
  asset: AssetWithBalance
  onSubmit: ({ to, amount, asset, memo }: { to: Address; amount: AssetAmount; asset: Asset; memo?: string }) => void
}

export const SendForm: React.FC<Props> = ({ onSubmit: onSubmitProp, assets = [], asset: assetWB }): JSX.Element => {
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

  const amountValidator = useCallback(
    async (_: unknown, stringValue: string) => {
      const value = bn(stringValue)
      if (Number.isNaN(value)) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.amount.shouldBeNumber' }))
      }

      if (!value.isGreaterThan(0)) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.amount.shouldBePositive' }))
      }

      if (value.isGreaterThan(assetWB.balance.amount())) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.send.errors.amount.shouldBeLessThatBalance' }))
      }
    },
    [assetWB, intl]
  )

  const onSubmit = useCallback(
    (data: Store) => {
      onSubmitProp({ to: data.recipient, amount: assetAmount(data.amount), asset: assetWB.asset, memo: data.memo })
    },
    [onSubmitProp, assetWB]
  )

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
              MAX: {formatAssetAmountCurrency(assetWB.balance, assetToString(assetWB.asset))}
            </Styled.StyledLabel>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
            <Form.Item name="memo">
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

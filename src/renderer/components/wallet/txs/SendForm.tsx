import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { bn, assetToString, Asset, formatAssetAmountCurrency, assetAmount } from '@thorchain/asgardex-util'
import { Row, Form } from 'antd'
import { Store } from 'antd/lib/form/interface'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import * as walletRoutes from '../../../routes/wallet'
import { SendTxParams } from '../../../services/binance/transaction'
import {
  AssetWithBalance,
  AssetsWithBalanceRD,
  AssetsWithBalance,
  AddressValidation
} from '../../../services/binance/types'
import { Input, InputNumber } from '../../uielements/input'
import AccountSelector from './../AccountSelector'
import * as Styled from './Form.style'

type Props = {
  assetsWB: AssetsWithBalanceRD
  assetWB: AssetWithBalance
  onSubmit: ({ to, amount, asset, memo }: SendTxParams) => void
  isLoading: boolean
  addressValidation: AddressValidation
}

export const SendForm: React.FC<Props> = (props): JSX.Element => {
  const { onSubmit: onSubmitProp, assetsWB, assetWB, isLoading = false, addressValidation } = props
  const intl = useIntl()
  const history = useHistory()

  const [form] = Styled.Form.useForm()

  const assets = useMemo(
    () =>
      FP.pipe(
        assetsWB,
        RD.getOrElse(() => [] as AssetsWithBalance)
      ),
    [assetsWB]
  )

  const addressValidator = useCallback(
    async (_: unknown, value: string) => {
      if (!value) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.empty' }))
      }
      if (!addressValidation(value.toLowerCase())) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.invalid' }))
      }
    },
    [addressValidation, intl]
  )

  const amountValidator = useCallback(
    async (_: unknown, stringValue: string) => {
      const value = bn(stringValue)
      if (Number.isNaN(value)) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }))
      }

      // TODO(Veado): Consider fees (https://github.com/thorchain/asgardex-electron/issues/369)
      if (!value.isGreaterThan(0)) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }))
      }

      if (value.isGreaterThan(assetWB.balance.amount())) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' }))
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
              <Input color="primary" size="large" disabled={isLoading} />
            </Form.Item>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
            <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
              <InputNumber min={0} size="large" disabled={isLoading} />
            </Styled.FormItem>
            <Styled.StyledLabel size="big">
              MAX: {formatAssetAmountCurrency(assetWB.balance, assetToString(assetWB.asset))}
            </Styled.StyledLabel>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
            <Form.Item name="memo">
              <Input size="large" disabled={isLoading} />
            </Form.Item>
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button loading={isLoading} htmlType="submit">
              {intl.formatMessage({ id: 'wallet.action.send' })}
            </Styled.Button>
          </Styled.SubmitItem>
        </Styled.Form>
      </Styled.Col>
    </Row>
  )
}

import React, { useCallback, useMemo } from 'react'

import { bn, assetAmount, assetToString, Asset, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { Row } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import * as walletRoutes from '../../../routes/wallet'
import { AssetWithBalance } from '../../../services/binance/types'
import { CoinInputAdvancedView } from '../../uielements/coins/coinInputAdvanced/CoinInputAdvanced.style'
import AccountSelector from '../AccountSelector'
import * as Styled from './Form.style'
import { FreezeAction } from './types'

type Props = {
  freezeAction: FreezeAction
  asset: AssetWithBalance
  onSubmit: (recipient: string, amount: number, symbol: string) => void
}

export const FreezeForm: React.FC<Props> = ({ freezeAction, onSubmit: onSubmitProp, asset: assetWB }): JSX.Element => {
  const intl = useIntl()
  const history = useHistory()

  const [form] = Styled.Form.useForm()

  const maxAmount = useMemo(() => {
    if (freezeAction === 'unfreeze') {
      return assetWB.frozenBalance || assetAmount(0)
    }
    return assetWB.balance
  }, [assetWB, freezeAction])

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
      onSubmitProp(data.recipient, data.amount, assetWB.asset.symbol)
    },
    [onSubmitProp, assetWB]
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

  const changeSelectorHandler = (asset: Asset) => {
    const path = walletRoutes.send.path({ asset: assetToString(asset) })
    history.push(path)
  }

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector onChange={changeSelectorHandler} selectedAsset={assetWB.asset} assets={[assetWB]} />
        <Styled.Form form={form} onFinish={onSubmit} labelCol={{ span: 24 }}>
          <Styled.SubForm>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
            <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
              <CoinInputAdvancedView color="primary" size="large" />
            </Styled.FormItem>
            <Styled.StyledLabel size="big">
              MAX: {formatAssetAmountCurrency(maxAmount, assetToString(assetWB.asset))}
            </Styled.StyledLabel>
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button htmlType="submit">{submitLabel}</Styled.Button>
          </Styled.SubmitItem>
        </Styled.Form>
      </Styled.Col>
    </Row>
  )
}

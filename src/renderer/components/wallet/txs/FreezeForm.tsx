import React, { useCallback, useMemo } from 'react'

import { bn, assetAmount, assetToString, Asset, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import { Row } from 'antd'
import { Store } from 'antd/lib/form/interface'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import * as walletRoutes from '../../../routes/wallet'
import { AssetWithBalance, FreezeAction, FreezeTxParams } from '../../../services/binance/types'
import { CoinInputAdvancedView } from '../../uielements/coins/coinInputAdvanced/CoinInputAdvanced.style'
import AccountSelector from '../AccountSelector'
import * as Styled from './Form.style'

type Props = {
  freezeAction: FreezeAction
  asset: AssetWithBalance
  onSubmit: ({ amount, asset, action }: FreezeTxParams) => void
  isLoading: boolean
}

export const FreezeForm: React.FC<Props> = (props): JSX.Element => {
  const { freezeAction, onSubmit: onSubmitProp, asset: assetWB, isLoading = false } = props
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
      onSubmitProp({ amount: assetAmount(data.amount), asset: assetWB.asset, action: freezeAction })
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
              <CoinInputAdvancedView color="primary" size="large" disabled={isLoading} />
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
        </Styled.Form>
      </Styled.Col>
    </Row>
  )
}

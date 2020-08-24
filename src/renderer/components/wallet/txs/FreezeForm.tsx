import React, { useCallback, useMemo } from 'react'

import {
  assetAmount,
  assetToString,
  formatAssetAmountCurrency,
  AssetAmount,
  formatAssetAmount
} from '@thorchain/asgardex-util'
import { Row } from 'antd'
import { Store } from 'antd/lib/form/interface'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { BNB_SYMBOL } from '../../../helpers/assetHelper'
import { AssetWithBalance, FreezeAction, FreezeTxParams } from '../../../services/binance/types'
import { InputNumber } from '../../uielements/input'
import AccountSelector from '../AccountSelector'
import * as Styled from './Form.style'
import { freezeAmountValidator } from './util'

type Props = {
  freezeAction: FreezeAction
  asset: AssetWithBalance
  bnbAmount: O.Option<AssetAmount>
  onSubmit: ({ amount, asset, action }: FreezeTxParams) => void
  isLoading: boolean
  fee: O.Option<AssetAmount>
}

export const FreezeForm: React.FC<Props> = (props): JSX.Element => {
  const { freezeAction, onSubmit: onSubmitProp, asset: assetWB, isLoading = false, bnbAmount, fee } = props

  const intl = useIntl()

  const [form] = Styled.Form.useForm()

  const maxAmount = useMemo(() => {
    if (freezeAction === 'unfreeze') {
      return assetWB.frozenBalance || assetAmount(0)
    }
    return assetWB.balance
  }, [assetWB, freezeAction])

  const amountValidator = useCallback(
    async (a: unknown, value: string) =>
      freezeAmountValidator({
        input: value,
        fee,
        maxAmount,
        bnbAmount: FP.pipe(
          bnbAmount,
          // no bnb asset == zero amount
          O.getOrElse(() => assetAmount(0))
        ),
        intl
      }),
    [bnbAmount, fee, intl, maxAmount]
  )

  const feeLabel = useMemo(
    () =>
      FP.pipe(
        fee,
        O.fold(
          () => '--',
          (f) => `${formatAssetAmount(f, 6)} ${BNB_SYMBOL}`
        )
      ),
    [fee]
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

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector selectedAsset={assetWB.asset} assets={[assetWB]} />
        <Styled.Form form={form} onFinish={onSubmit} labelCol={{ span: 24 }}>
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
              <>
                {intl.formatMessage({ id: 'common.max' })}:{' '}
                {formatAssetAmountCurrency(assetWB.balance, assetToString(assetWB.asset))}
                <br />
                {intl.formatMessage({ id: 'common.fees' })}: {feeLabel}
              </>
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

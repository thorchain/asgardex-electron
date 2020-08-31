import React, { useCallback, useMemo } from 'react'

import {
  assetAmount,
  assetToString,
  formatAssetAmountCurrency,
  AssetAmount,
  formatAssetAmount
} from '@thorchain/asgardex-util'
import { Row, Form } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { BNB_SYMBOL } from '../../../helpers/assetHelper'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { AssetWithBalance, FreezeAction, FreezeTxParams } from '../../../services/binance/types'
import { InputBigNumber } from '../../uielements/input'
import AccountSelector from '../AccountSelector'
import * as Styled from './Form.style'
import { validateFreezeInput } from './util'

export type FormValues = {
  amount: string
}

type Props = {
  freezeAction: FreezeAction
  assetWB: AssetWithBalance
  bnbAmount: O.Option<AssetAmount>
  onSubmit: ({ amount, asset, action }: FreezeTxParams) => void
  isLoading: boolean
  fee: O.Option<AssetAmount>
}

export const FreezeForm: React.FC<Props> = (props): JSX.Element => {
  const { freezeAction, onSubmit: onSubmitProp, assetWB, isLoading = false, bnbAmount: oBnbAmount, fee: oFee } = props

  const intl = useIntl()

  const [form] = Form.useForm<FormValues>()

  const maxAmount = useMemo(() => {
    if (freezeAction === 'unfreeze') {
      return assetWB.frozenBalance || assetAmount(0)
    }
    return assetWB.balance
  }, [assetWB, freezeAction])

  const amountValidator = useCallback(
    async (a: unknown, value: string) =>
      validateFreezeInput({
        input: value,
        maxAmount,
        intl
      }),
    [intl, maxAmount]
  )

  const feeLabel = useMemo(
    () =>
      FP.pipe(
        oFee,
        O.fold(
          () => '--',
          (f) => `${formatAssetAmount(f, 6)} ${BNB_SYMBOL}`
        )
      ),
    [oFee]
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

  const isFeeError = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oFee, oBnbAmount),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFee),
        ([fee, bnbAmount]) => bnbAmount.amount().isLessThan(fee.amount())
      )
    )
  }, [oBnbAmount, oFee])

  const renderFeeError = useMemo(() => {
    if (!isFeeError) return <></>

    const amount = FP.pipe(
      oBnbAmount,
      // no bnb asset == zero amount
      O.getOrElse(() => assetAmount(0))
    )

    const msg = intl.formatMessage(
      { id: 'wallet.errors.fee.notCovered' },
      { fee: formatAssetAmount(amount, 6), balance: `${formatAssetAmount(amount, 8)} ${BNB_SYMBOL}` }
    )

    return (
      <Styled.StyledLabel size="big" color="error">
        {msg}
      </Styled.StyledLabel>
    )
  }, [oBnbAmount, intl, isFeeError])

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
              <InputBigNumber min={0} size="large" disabled={isLoading} decimal={8} />
            </Styled.FormItem>
            <Styled.StyledLabel size="big">
              <>
                {intl.formatMessage({ id: 'common.max' })}:{' '}
                {formatAssetAmountCurrency(assetWB.balance, assetToString(assetWB.asset))}
                <br />
                {intl.formatMessage({ id: 'common.fees' })}: {feeLabel}
              </>
            </Styled.StyledLabel>
            {renderFeeError}
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button loading={isLoading} disabled={isFeeError} htmlType="submit">
              {submitLabel}
            </Styled.Button>
          </Styled.SubmitItem>
        </Form>
      </Styled.Col>
    </Row>
  )
}

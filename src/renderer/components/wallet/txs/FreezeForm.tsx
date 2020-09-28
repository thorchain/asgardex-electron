import React, { useCallback, useMemo } from 'react'

import {
  assetAmount,
  assetToString,
  formatAssetAmountCurrency,
  AssetAmount,
  formatAssetAmount,
  bn,
  baseToAsset,
  AssetBNB
} from '@thorchain/asgardex-util'
import { Row, Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { ZERO_ASSET_AMOUNT } from '../../../const'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { trimZeros } from '../../../helpers/stringHelper'
import { FreezeAction, FreezeTxParams } from '../../../services/binance/types'
import { AssetWithBalance } from '../../../services/wallet/types'
import { InputBigNumber } from '../../uielements/input'
import AccountSelector from '../AccountSelector'
import * as Styled from './Form.style'
import { validateTxAmountInput } from './util'

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
      return FP.pipe(
        assetWB.frozenAmount,
        O.map(baseToAsset),
        O.getOrElse(() => ZERO_ASSET_AMOUNT)
      )
    }
    return baseToAsset(assetWB.amount)
  }, [assetWB, freezeAction])

  const amountValidator = useCallback(
    async (_: unknown, value: BigNumber) => {
      const msg3Id =
        freezeAction === 'freeze'
          ? 'wallet.errors.amount.shouldBeLessThanBalance'
          : 'wallet.errors.amount.shouldBeLessThanFrozenBalance'
      return validateTxAmountInput({
        input: value,
        maxAmount,
        errors: {
          msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
          msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
          msg3: intl.formatMessage({ id: msg3Id })
        }
      })
    },
    [freezeAction, intl, maxAmount]
  )

  const feeLabel = useMemo(
    () =>
      FP.pipe(
        oFee,
        O.fold(
          () => '--',
          (f) => `${trimZeros(formatAssetAmount(f, 8))} ${AssetBNB.symbol}`
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
      O.getOrElse(() => ZERO_ASSET_AMOUNT)
    )

    const msg = intl.formatMessage(
      { id: 'wallet.errors.fee.notCovered' },
      { fee: formatAssetAmount(amount, 6), balance: `${formatAssetAmount(amount, 8)} ${AssetBNB.symbol}` }
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
        <Styled.Form
          form={form}
          initialValues={{ amount: bn(0) }}
          onFinish={onSubmit}
          labelCol={{ span: 24 }}
          style={{ padding: '30px' }}>
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
                {formatAssetAmountCurrency(baseToAsset(assetWB.amount), assetToString(assetWB.asset))}
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
        </Styled.Form>
      </Styled.Col>
    </Row>
  )
}

import React, { useCallback, useMemo } from 'react'

import { Balance } from '@xchainjs/xchain-client'
import { formatAssetAmountCurrency, AssetAmount, bn, baseToAsset, AssetBNB, baseAmount } from '@xchainjs/xchain-util'
import { Row, Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { ZERO_ASSET_AMOUNT } from '../../../../const'
import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { WalletBalance } from '../../../../types/wallet'
import { InputBigNumber } from '../../../uielements/input'
import { AccountSelector } from '../../account/'
import * as Styled from '../TxForm.style'
import { validateTxAmountInput } from '../TxForm.util'

export type FormValues = {
  amount: string
}

export type Props = {
  balance: WalletBalance
  bnbAmount: O.Option<AssetAmount>
  onSubmit: ({ amount, asset }: Balance) => void
  isLoading: boolean
  fee: O.Option<AssetAmount>
}

export const UpgradeForm: React.FC<Props> = (props): JSX.Element => {
  const { onSubmit: onSubmitProp, balance, isLoading = false, bnbAmount: oBnbAmount, fee: oFee } = props

  const intl = useIntl()

  const [form] = Form.useForm<FormValues>()

  const maxAmount = useMemo(() => baseToAsset(balance.amount), [balance])

  const amountValidator = useCallback(
    async (_: unknown, value: BigNumber) =>
      validateTxAmountInput({
        input: value,
        maxAmount,
        errors: {
          msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
          msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
          msg3: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' })
        }
      }),
    [intl, maxAmount]
  )

  const feeLabel = useMemo(
    () =>
      FP.pipe(
        oFee,
        O.fold(
          () => '--',
          (fee) => formatAssetAmountCurrency({ amount: fee, asset: AssetBNB, trimZeros: true })
        )
      ),
    [oFee]
  )

  const onSubmit = useCallback(
    ({ amount }: FormValues) => {
      onSubmitProp({ amount: baseAmount(amount), asset: balance.asset })
    },
    [balance.asset, onSubmitProp]
  )

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
      { balance: formatAssetAmountCurrency({ amount, asset: AssetBNB, trimZeros: true }) }
    )

    return (
      <Styled.Label size="big" color="error">
        {msg}
      </Styled.Label>
    )
  }, [isFeeError, oBnbAmount, intl])

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector selectedAsset={balance.asset} walletBalances={[balance]} />
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
            <Styled.Label size="big">
              <>
                {intl.formatMessage({ id: 'common.max' })}:{' '}
                {formatAssetAmountCurrency({
                  amount: baseToAsset(balance.amount),
                  asset: balance.asset,
                  trimZeros: true
                })}
                <br />
                {intl.formatMessage({ id: 'common.fees' })}: {feeLabel}
              </>
            </Styled.Label>
            {renderFeeError}
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button loading={isLoading} disabled={isFeeError} htmlType="submit">
              {intl.formatMessage({ id: 'wallet.action.upgrade' })}
            </Styled.Button>
          </Styled.SubmitItem>
        </Styled.Form>
      </Styled.Col>
    </Row>
  )
}

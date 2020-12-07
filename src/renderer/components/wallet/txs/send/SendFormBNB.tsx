import React, { useCallback, useMemo } from 'react'

import { Address } from '@xchainjs/xchain-binance'
import {
  formatAssetAmountCurrency,
  assetAmount,
  AssetAmount,
  bn,
  baseToAsset,
  AssetBNB,
  assetToBase
} from '@xchainjs/xchain-util'
import { Row, Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { ZERO_ASSET_AMOUNT, ZERO_BN } from '../../../../const'
import { isBnbAsset } from '../../../../helpers/assetHelper'
import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { getBnbAmountFromBalances } from '../../../../helpers/walletHelper'
import { AddressValidation, SendTxParams } from '../../../../services/binance/types'
import { WalletBalance } from '../../../../types/wallet'
import { Input, InputBigNumber } from '../../../uielements/input'
import { AccountSelector } from '../../account'
import * as Styled from '../TxForm.style'
import { validateTxAmountInput } from '../TxForm.util'
import { useChangeAssetHandler } from './Send.hooks'

export type FormValues = {
  recipient: Address
  amount: string
  memo?: string
}

type Props = {
  balances: WalletBalance[]
  balance: WalletBalance
  onSubmit: ({ recipient, amount, asset, memo }: SendTxParams) => void
  isLoading?: boolean
  addressValidation: AddressValidation
  fee: O.Option<AssetAmount>
}

export const SendFormBNB: React.FC<Props> = (props): JSX.Element => {
  const { onSubmit, balances, balance, isLoading = false, addressValidation, fee: oFee } = props
  const intl = useIntl()

  const changeAssetHandler = useChangeAssetHandler()

  const [form] = Form.useForm<FormValues>()

  const oBnbAmount: O.Option<AssetAmount> = useMemo(() => {
    // return balance of current asset (if BNB)
    if (isBnbAsset(balance.asset)) {
      return O.some(baseToAsset(balance.amount))
    }
    // or check list of other assets to get bnb balance
    return FP.pipe(balances, getBnbAmountFromBalances)
  }, [balance, balances])

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
      {
        balance: formatAssetAmountCurrency({ amount, asset: AssetBNB, trimZeros: true })
      }
    )

    return (
      <Styled.Label size="big" color="error">
        {msg}
      </Styled.Label>
    )
  }, [oBnbAmount, intl, isFeeError])

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

  // max amount for bnb
  const maxAmount = useMemo(() => {
    const maxBnbAmount = FP.pipe(
      sequenceTOption(oFee, oBnbAmount),
      O.fold(
        // Set maxAmount to zero if we dont know anything about bnb and fee amounts
        () => ZERO_BN,
        ([fee, bnbAmount]) => bnbAmount.amount().minus(fee.amount())
      ),
      assetAmount
    )
    return isBnbAsset(balance.asset) ? maxBnbAmount : baseToAsset(balance.amount)
  }, [oFee, oBnbAmount, balance])

  const amountValidator = useCallback(
    async (_: unknown, value: BigNumber) => {
      // error messages
      const errors = {
        msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
        msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
        msg3: isBnbAsset(balance.asset)
          ? intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalanceAndFee' })
          : intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' })
      }
      return validateTxAmountInput({ input: value, maxAmount, errors })
    },
    [balance, intl, maxAmount]
  )

  const onFinishHandler = useCallback(
    ({ amount, recipient, memo }: FormValues) => {
      onSubmit({ recipient, amount: assetToBase(assetAmount(amount)), asset: balance.asset, memo })
    },
    [onSubmit, balance]
  )

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector onChange={changeAssetHandler} selectedAsset={balance.asset} walletBalances={balances} />
        <Styled.Form form={form} initialValues={{ amount: bn(0) }} onFinish={onFinishHandler} labelCol={{ span: 24 }}>
          <Styled.SubForm>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.address' })}</Styled.CustomLabel>
            <Form.Item rules={[{ required: true, validator: addressValidator }]} name="recipient">
              <Input color="primary" size="large" disabled={isLoading} />
            </Form.Item>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
            <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
              <InputBigNumber min={0} size="large" disabled={isLoading} decimal={8} />
            </Styled.FormItem>
            <Styled.Label size="big">
              <>
                {intl.formatMessage({ id: 'common.max' })}:{' '}
                {formatAssetAmountCurrency({
                  amount: maxAmount,
                  asset: balance.asset,
                  trimZeros: true
                })}
                <br />
                {intl.formatMessage({ id: 'common.fees' })}: {feeLabel}
              </>
            </Styled.Label>
            {renderFeeError}
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
            <Form.Item name="memo">
              <Input size="large" disabled={isLoading} />
            </Form.Item>
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button loading={isLoading} disabled={isFeeError} htmlType="submit">
              {intl.formatMessage({ id: 'wallet.action.send' })}
            </Styled.Button>
          </Styled.SubmitItem>
        </Styled.Form>
      </Styled.Col>
    </Row>
  )
}

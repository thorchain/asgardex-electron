import React, { useCallback, useMemo } from 'react'

import { Address } from '@xchainjs/xchain-ethereum'
import {
  formatAssetAmountCurrency,
  assetAmount,
  AssetAmount,
  bn,
  baseToAsset,
  AssetETH,
  assetToBase
} from '@xchainjs/xchain-util'
import { Row, Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { ZERO_ASSET_AMOUNT, ZERO_BN } from '../../../../const'
import { isEthAsset } from '../../../../helpers/assetHelper'
import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { getEthAmountFromBalances } from '../../../../helpers/walletHelper'
import { WalletBalances } from '../../../../services/clients'
import { AddressValidation, SendTxParams } from '../../../../services/ethereum/types'
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
  balances: WalletBalances
  balance: WalletBalance
  onSubmit: ({ recipient, amount, asset, memo }: SendTxParams) => void
  isLoading?: boolean
  addressValidation: AddressValidation
  fee: O.Option<AssetAmount>
}

export const SendFormETH: React.FC<Props> = (props): JSX.Element => {
  const { onSubmit, balances, balance, isLoading = false, addressValidation, fee: oFee } = props
  const intl = useIntl()

  const changeAssetHandler = useChangeAssetHandler()

  const [form] = Form.useForm<FormValues>()

  const oEthAmount: O.Option<AssetAmount> = useMemo(() => {
    // return balance of current asset (if ETH)
    if (isEthAsset(balance.asset)) {
      return O.some(baseToAsset(balance.amount))
    }
    // or check list of other assets to get eth balance
    return FP.pipe(balances, getEthAmountFromBalances)
  }, [balance, balances])

  const feeLabel = useMemo(
    () =>
      FP.pipe(
        oFee,
        O.fold(
          () => '--',
          (fee) => formatAssetAmountCurrency({ amount: fee, asset: AssetETH, trimZeros: true })
        )
      ),
    [oFee]
  )

  const isFeeError = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oFee, oEthAmount),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFee),
        ([fee, ethAmount]) => ethAmount.amount().isLessThan(fee.amount())
      )
    )
  }, [oEthAmount, oFee])

  const renderFeeError = useMemo(() => {
    if (!isFeeError) return <></>

    const amount = FP.pipe(
      oEthAmount,
      // no eth asset == zero amount
      O.getOrElse(() => ZERO_ASSET_AMOUNT)
    )

    const msg = intl.formatMessage(
      { id: 'wallet.errors.fee.notCovered' },
      {
        balance: formatAssetAmountCurrency({ amount, asset: AssetETH, trimZeros: true })
      }
    )

    return (
      <Styled.Label size="big" color="error">
        {msg}
      </Styled.Label>
    )
  }, [oEthAmount, intl, isFeeError])

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

  // max amount for eth
  const maxAmount = useMemo(() => {
    const maxEthAmount = FP.pipe(
      sequenceTOption(oFee, oEthAmount),
      O.fold(
        // Set maxAmount to zero if we dont know anything about eth and fee amounts
        () => ZERO_BN,
        ([fee, ethAmount]) => ethAmount.amount().minus(fee.amount())
      ),
      assetAmount
    )
    return isEthAsset(balance.asset) ? maxEthAmount : baseToAsset(balance.amount)
  }, [oFee, oEthAmount, balance])

  const amountValidator = useCallback(
    async (_: unknown, value: BigNumber) => {
      // error messages
      const errors = {
        msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
        msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
        msg3: isEthAsset(balance.asset)
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

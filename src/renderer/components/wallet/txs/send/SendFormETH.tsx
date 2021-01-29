import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { FeeOptionKey } from '@xchainjs/xchain-client'
import { Address, FeesParams, FeesWithGasPricesAndLimits, validateAddress } from '@xchainjs/xchain-ethereum'
import {
  formatAssetAmountCurrency,
  assetAmount,
  AssetAmount,
  bn,
  baseToAsset,
  AssetETH,
  assetToBase,
  BaseAmount
} from '@xchainjs/xchain-util'
import { Row, Form, Col } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { ZERO_ASSET_AMOUNT, ZERO_BN } from '../../../../const'
import { isEthAsset } from '../../../../helpers/assetHelper'
import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { getEthAmountFromBalances } from '../../../../helpers/walletHelper'
import { WalletBalances } from '../../../../services/clients'
import { FeesWithGasPricesAndLimitsLD, SendTxParams } from '../../../../services/ethereum/types'
import { WalletBalance } from '../../../../types/wallet'
import * as StyledR from '../../../shared/form/Radio.style'
import { Input, InputBigNumber } from '../../../uielements/input'
import { AccountSelector } from '../../account'
import * as Styled from '../TxForm.style'
import { validateTxAmountInput } from '../TxForm.util'
import { useChangeAssetHandler } from './Send.hooks'
import * as StyledForm from './SendForm.style'

export type FormValues = {
  recipient: Address
  amount: string
  memo?: string
}

export type Props = {
  balances: WalletBalances
  balance: WalletBalance
  onSubmit: ({ recipient, amount, asset, memo, gasPrice }: SendTxParams) => void
  isLoading?: boolean
  fees$: (params: FeesParams) => FeesWithGasPricesAndLimitsLD
  reloadFeesHandler: () => void
}

export const SendFormETH: React.FC<Props> = (props): JSX.Element => {
  const { onSubmit, balances, balance, isLoading = false, fees$, reloadFeesHandler } = props
  const intl = useIntl()

  const changeAssetHandler = useChangeAssetHandler()

  const [selectedFeeOptionKey, setSelectedFeeOptionKey] = useState<FeeOptionKey>('fastest')

  const [form] = Form.useForm<FormValues>()

  const prevFeesWithGasPricesAndLimitsRef = useRef<O.Option<FeesWithGasPricesAndLimits>>(O.none)

  const [feesWithGasPricesAndLimitsRD] = useObservableState(
    () =>
      fees$({
        asset: balance.asset,
        amount: form.getFieldValue('amount'),
        recipient: form.getFieldValue('recipient')
      }),
    RD.initial
  )

  const oFeesWithGasPricesAndLimits: O.Option<FeesWithGasPricesAndLimits> = useMemo(
    () => FP.pipe(feesWithGasPricesAndLimitsRD, RD.toOption),
    [feesWithGasPricesAndLimitsRD]
  )

  const feesAvailable = useMemo(() => O.isSome(oFeesWithGasPricesAndLimits), [oFeesWithGasPricesAndLimits])

  // Store latest fees as `ref`
  // needed to display previous fee while reloading
  useEffect(() => {
    FP.pipe(
      oFeesWithGasPricesAndLimits,
      O.map(
        (feesWithGasPricesAndLimits) => (prevFeesWithGasPricesAndLimitsRef.current = O.some(feesWithGasPricesAndLimits))
      )
    )
  }, [oFeesWithGasPricesAndLimits])

  const selectedFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        oFeesWithGasPricesAndLimits,
        O.map(({ fees }) => fees[selectedFeeOptionKey])
      ),
    [oFeesWithGasPricesAndLimits, selectedFeeOptionKey]
  )

  const selectedGasPrice: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        oFeesWithGasPricesAndLimits,
        O.map(({ gasPrices }) => gasPrices[selectedFeeOptionKey])
      ),
    [oFeesWithGasPricesAndLimits, selectedFeeOptionKey]
  )

  const selectedGasLimit: O.Option<ethers.BigNumber> = useMemo(
    () =>
      FP.pipe(
        oFeesWithGasPricesAndLimits,
        O.map(({ gasLimits }) => gasLimits[selectedFeeOptionKey])
      ),
    [oFeesWithGasPricesAndLimits, selectedFeeOptionKey]
  )

  const oEthAmount: O.Option<AssetAmount> = useMemo(() => {
    // return balance of current asset (if ETH)
    if (isEthAsset(balance.asset)) {
      return O.some(baseToAsset(balance.amount))
    }
    // or check list of other assets to get eth balance
    return FP.pipe(balances, getEthAmountFromBalances)
  }, [balance, balances])

  const isFeeError = useMemo(() => {
    return FP.pipe(
      sequenceTOption(selectedFee, oEthAmount),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => false,
        ([fee, ethAmount]) => ethAmount.amount().isLessThan(baseToAsset(fee).amount())
      )
    )
  }, [oEthAmount, selectedFee])

  const selectedFeeLabel = useMemo(
    () =>
      FP.pipe(
        feesWithGasPricesAndLimitsRD,
        RD.fold(
          () => '...',
          () =>
            // show previous fees while re-loading
            FP.pipe(
              prevFeesWithGasPricesAndLimitsRef.current,
              O.map(({ fees }) =>
                formatAssetAmountCurrency({
                  amount: baseToAsset(fees[selectedFeeOptionKey]),
                  asset: AssetETH,
                  trimZeros: true
                })
              ),
              O.getOrElse(() => '...')
            ),
          (error) => `${intl.formatMessage({ id: 'common.error' })} ${error?.message ?? ''}`,
          ({ fees }) =>
            formatAssetAmountCurrency({
              amount: baseToAsset(fees[selectedFeeOptionKey]),
              asset: AssetETH,
              trimZeros: true
            })
        )
      ),
    [feesWithGasPricesAndLimitsRD, intl, selectedFeeOptionKey]
  )

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
        balance: formatAssetAmountCurrency({
          amount,
          asset: AssetETH,
          trimZeros: true
        })
      }
    )

    return (
      <Styled.Label size="big" color="error">
        {msg}
      </Styled.Label>
    )
  }, [oEthAmount, intl, isFeeError])

  const feeOptionsLabel: Record<FeeOptionKey, string> = useMemo(
    () => ({
      fast: intl.formatMessage({ id: 'wallet.send.fast' }),
      fastest: intl.formatMessage({ id: 'wallet.send.fastest' }),
      average: intl.formatMessage({ id: 'wallet.send.average' })
    }),
    [intl]
  )

  const renderFeeOptionsRadioGroup = useCallback(() => {
    const onChangeHandler = (e: RadioChangeEvent) => setSelectedFeeOptionKey(e.target.value)

    return (
      <StyledR.Radio.Group onChange={onChangeHandler} value={selectedFeeOptionKey} disabled={isLoading}>
        <StyledR.Radio value="fastest" key="fastest">
          <StyledR.RadioLabel>{feeOptionsLabel['fastest']}</StyledR.RadioLabel>
        </StyledR.Radio>
        <StyledR.Radio value="fast" key="fast">
          <StyledR.RadioLabel>{feeOptionsLabel['fast']}</StyledR.RadioLabel>
        </StyledR.Radio>
        <StyledR.Radio value="average" key="average">
          <StyledR.RadioLabel>{feeOptionsLabel['average']}</StyledR.RadioLabel>
        </StyledR.Radio>
      </StyledR.Radio.Group>
    )
  }, [feeOptionsLabel, isLoading, selectedFeeOptionKey])

  const renderFeeOptions = useMemo(
    () =>
      FP.pipe(
        oFeesWithGasPricesAndLimits,
        O.fold(
          () =>
            // render radio group while reloading fees
            FP.pipe(
              prevFeesWithGasPricesAndLimitsRef.current,
              O.map(renderFeeOptionsRadioGroup),
              O.getOrElse(() => <></>)
            ),
          renderFeeOptionsRadioGroup
        )
      ),
    [prevFeesWithGasPricesAndLimitsRef, oFeesWithGasPricesAndLimits, renderFeeOptionsRadioGroup]
  )

  const addressValidator = useCallback(
    async (_: unknown, value: string) => {
      if (!value) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.empty' }))
      }
      if (!validateAddress(value.toLowerCase())) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.invalid' }))
      }
    },
    [intl]
  )

  // max amount for eth
  const maxAmount = useMemo(() => {
    const maxEthAmount = FP.pipe(
      sequenceTOption(selectedFee, oEthAmount),
      O.fold(
        // Set maxAmount to zero if we dont know anything about eth and fee amounts
        () => ZERO_BN,
        ([fee, ethAmount]) => {
          return ethAmount.amount().minus(baseToAsset(fee).amount())
        }
      ),
      assetAmount
    )
    return isEthAsset(balance.asset) ? maxEthAmount : baseToAsset(balance.amount)
  }, [selectedFee, oEthAmount, balance])

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
    ({ amount, recipient, memo }: FormValues) =>
      FP.pipe(
        sequenceTOption(selectedGasPrice, selectedGasLimit),
        O.map(([gasPrice, gasLimit]) => {
          onSubmit({
            recipient,
            amount: assetToBase(assetAmount(amount)),
            asset: balance.asset,
            memo,
            gasPrice,
            gasLimit
          })
          return true
        })
      ),
    [balance.asset, onSubmit, selectedGasLimit, selectedGasPrice]
  )

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector onChange={changeAssetHandler} selectedAsset={balance.asset} walletBalances={balances} />
        <Styled.Form
          form={form}
          initialValues={{
            // default value for BigNumberInput
            amount: bn(0),
            // Default value for RadioGroup of feeOptions
            fee: 'fastest'
          }}
          onFinish={onFinishHandler}
          labelCol={{ span: 24 }}>
          <Styled.SubForm>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.address' })}</Styled.CustomLabel>
            <Form.Item rules={[{ required: true, validator: addressValidator }]} name="recipient">
              <Input color="primary" size="large" disabled={isLoading} />
            </Form.Item>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
            <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
              <InputBigNumber min={0} size="large" disabled={isLoading} decimal={8} />
            </Styled.FormItem>
            <Styled.Label size="big" style={{ marginBottom: 0, paddingBottom: 0 }}>
              {intl.formatMessage({ id: 'common.max' })}:{' '}
              {formatAssetAmountCurrency({
                amount: maxAmount,
                asset: balance.asset,
                trimZeros: true
              })}
            </Styled.Label>
            <Row align="middle">
              <Col>
                <StyledForm.FeeLabel
                  size="big"
                  color={RD.isFailure(feesWithGasPricesAndLimitsRD) ? 'error' : 'primary'}
                  style={{ paddingTop: 0 }}
                  disabled={RD.isPending(feesWithGasPricesAndLimitsRD)}>
                  {intl.formatMessage({ id: 'common.fees' })}: {selectedFeeLabel}
                </StyledForm.FeeLabel>
              </Col>
              <Col>
                <StyledForm.FeeButton onClick={reloadFeesHandler} disabled={RD.isPending(feesWithGasPricesAndLimitsRD)}>
                  <SyncOutlined />
                </StyledForm.FeeButton>
              </Col>
            </Row>
            {renderFeeError}
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
            <Form.Item name="memo">
              <Input size="large" disabled={isLoading} />
            </Form.Item>
            <Form.Item name="fee">{renderFeeOptions}</Form.Item>
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button loading={isLoading} disabled={!feesAvailable || isLoading} htmlType="submit">
              {intl.formatMessage({ id: 'wallet.action.send' })}
            </Styled.Button>
          </Styled.SubmitItem>
        </Styled.Form>
      </Styled.Col>
    </Row>
  )
}

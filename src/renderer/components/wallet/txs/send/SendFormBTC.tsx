import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { FeeOptions, FeeOptionsKey } from '@thorchain/asgardex-bitcoin/lib/types/client-types'
import {
  assetAmount,
  AssetBTC,
  assetToBase,
  baseAmount,
  baseToAsset,
  bn,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
import { Row, Form, Col } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { ZERO_BN } from '../../../../const'
import { BTC_DECIMAL } from '../../../../helpers/assetHelper'
import { AddressValidation, FeesRD, SendTxParams } from '../../../../services/bitcoin/types'
import { AssetsWithBalance, AssetWithBalance } from '../../../../services/wallet/types'
import * as StyledR from '../../../shared/form/Radio.style'
import { Input, InputBigNumber } from '../../../uielements/input'
import { AccountSelector } from '../../account'
import * as Styled from '../TxForm.style'
import { validateTxAmountInput } from '../TxForm.util'
import { useChangeAssetHandler } from './Send.hooks'
import * as StyledBTC from './SendFormBTC.style'

export type FormValues = {
  recipient: string
  amount: string
  memo?: string
  feeRate?: number
}

type Props = {
  assetsWB: AssetsWithBalance
  assetWB: AssetWithBalance
  onSubmit: ({ to, amount, feeRate, memo }: SendTxParams) => void
  isLoading?: boolean
  addressValidation: AddressValidation
  fees: FeesRD
  reloadFeesHandler: () => void
}

export const SendFormBTC: React.FC<Props> = (props): JSX.Element => {
  const { onSubmit, assetsWB, assetWB, addressValidation, isLoading, fees: feesRD, reloadFeesHandler } = props

  const changeAssetHandler = useChangeAssetHandler()

  const intl = useIntl()

  const [selectedFeeKey, setSelectedFeeKey] = useState<FeeOptionsKey>('fast')

  const [form] = Form.useForm<FormValues>()

  const prevFeesRef = useRef<O.Option<FeeOptions>>(O.none)

  const feesAvailable = useMemo(() => O.isSome(prevFeesRef.current), [])

  const oFees: O.Option<FeeOptions> = useMemo(() => FP.pipe(feesRD, RD.toOption), [feesRD])

  // Store latest fees as `ref`
  // needed to display previous fee while reloading
  useEffect(() => {
    FP.pipe(
      oFees,
      O.map((fees) => (prevFeesRef.current = O.some(fees)))
    )
  }, [oFees])

  const selectedFeeOption = useMemo(
    () =>
      FP.pipe(
        oFees,
        O.map((fees) => fees[selectedFeeKey])
      ),
    [oFees, selectedFeeKey]
  )

  const oFeeTotalBaseAmount = useMemo(
    () =>
      FP.pipe(
        oFees,
        // transformation: number -> BaseAmount -> AssetAmount
        O.map((fees) => baseAmount(fees[selectedFeeKey].feeTotal, BTC_DECIMAL))
      ),
    [oFees, selectedFeeKey]
  )

  const isFeeError = useMemo(() => {
    return FP.pipe(
      oFeeTotalBaseAmount,
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => false,
        (fee) => assetWB.amount.amount().isLessThan(fee.amount())
      )
    )
  }, [assetWB.amount, oFeeTotalBaseAmount])

  const selectedFeeLabel = useMemo(
    () =>
      FP.pipe(
        feesRD,
        RD.fold(
          () => '...',
          () =>
            // show previous fees while re-loading
            FP.pipe(
              prevFeesRef.current,
              O.map((fees) =>
                formatAssetAmountCurrency({
                  amount: baseToAsset(baseAmount(fees[selectedFeeKey].feeTotal, BTC_DECIMAL)),
                  asset: AssetBTC,
                  trimZeros: true
                })
              ),
              O.getOrElse(() => '...')
            ),
          (error) => `${intl.formatMessage({ id: 'common.error' })} ${error?.message ?? ''}`,
          (fees) =>
            formatAssetAmountCurrency({
              amount: baseToAsset(baseAmount(fees[selectedFeeKey].feeTotal, BTC_DECIMAL)),
              asset: AssetBTC,
              trimZeros: true
            })
        )
      ),
    [feesRD, intl, selectedFeeKey]
  )

  const renderFeeError = useMemo(() => {
    if (!isFeeError) return <></>

    const msg = intl.formatMessage(
      { id: 'wallet.errors.fee.notCovered' },
      {
        balance: formatAssetAmountCurrency({ amount: baseToAsset(assetWB.amount), asset: AssetBTC, trimZeros: true })
      }
    )

    return (
      <Styled.Label size="big" color="error">
        {msg}
      </Styled.Label>
    )
  }, [assetWB.amount, intl, isFeeError])

  const feeOptionsLabel: Record<FeeOptionsKey, string> = useMemo(
    () => ({
      fast: intl.formatMessage({ id: 'wallet.send.fast' }),
      regular: intl.formatMessage({ id: 'wallet.send.regular' }),
      slow: intl.formatMessage({ id: 'wallet.send.slow' })
    }),
    [intl]
  )

  const renderFeeOptionsRadioGroup = useCallback(
    (fees) => {
      const onChangeHandler = (e: RadioChangeEvent) => setSelectedFeeKey(e.target.value)
      return (
        <StyledR.Radio.Group onChange={onChangeHandler} value={selectedFeeKey} disabled={isLoading}>
          {Object.keys(fees).map((key) => (
            <StyledR.Radio value={key as FeeOptionsKey} key={key}>
              <StyledR.RadioLabel>{feeOptionsLabel[key as FeeOptionsKey]}</StyledR.RadioLabel>
            </StyledR.Radio>
          ))}
        </StyledR.Radio.Group>
      )
    },

    [feeOptionsLabel, isLoading, selectedFeeKey]
  )

  const renderFeeOptions = useMemo(
    () =>
      FP.pipe(
        oFees,
        O.fold(
          () =>
            // render radio group while reloading fees
            FP.pipe(
              prevFeesRef.current,
              O.map(renderFeeOptionsRadioGroup),
              O.getOrElse(() => <></>)
            ),
          renderFeeOptionsRadioGroup
        )
      ),
    [prevFeesRef, oFees, renderFeeOptionsRadioGroup]
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
    async (_: unknown, value: BigNumber) => {
      // max amount
      const maxAmount = FP.pipe(
        selectedFeeOption,
        O.map(({ feeTotal }) => {
          // transformation of `feeTotal`: number -> BaseAmount -> BigNumber
          const feeTotalAmount = baseAmount(feeTotal, BTC_DECIMAL).amount()
          return assetWB.amount.amount().minus(feeTotalAmount)
        }),
        // Set maxAmount to zero as long as we dont have a feeRate
        O.getOrElse(() => ZERO_BN),
        baseAmount,
        baseToAsset
      )

      // error messages
      const errors = {
        msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
        msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
        msg3: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalanceAndFee' })
      }
      return validateTxAmountInput({ input: value, maxAmount, errors })
    },
    [assetWB.amount, intl, selectedFeeOption]
  )

  const onFinishHandler = useCallback(
    ({ amount, recipient, memo }: FormValues) =>
      FP.pipe(
        selectedFeeOption,
        O.map(({ feeRate }) => {
          onSubmit({ to: recipient, amount: assetToBase(assetAmount(amount)), feeRate, memo })
          return true
        })
      ),
    [onSubmit, selectedFeeOption]
  )

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector onChange={changeAssetHandler} selectedAsset={assetWB.asset} assets={assetsWB} />
        <Styled.Form
          form={form}
          initialValues={{
            // default value for BigNumberInput
            amount: bn(0),
            // Default value for RadioGroup of feeOptions
            feeRate: 'fast'
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
              <InputBigNumber min={0} size="large" disabled={isLoading} decimal={BTC_DECIMAL} />
            </Styled.FormItem>
            <Styled.Label size="big" style={{ marginBottom: 0, paddingBottom: 0 }}>
              {intl.formatMessage({ id: 'common.max' })}:{' '}
              {formatAssetAmountCurrency({
                amount: baseToAsset(assetWB.amount),
                asset: assetWB.asset,
                trimZeros: true
              })}
            </Styled.Label>
            <Row align="middle">
              <Col>
                <StyledBTC.FeeLabel
                  size="big"
                  color={RD.isFailure(feesRD) ? 'error' : 'primary'}
                  style={{ paddingTop: 0 }}
                  disabled={RD.isPending(feesRD)}>
                  {intl.formatMessage({ id: 'common.fees' })}: {selectedFeeLabel}
                </StyledBTC.FeeLabel>
              </Col>
              <Col>
                <StyledBTC.FeeButton onClick={reloadFeesHandler} disabled={RD.isPending(feesRD)}>
                  <SyncOutlined />
                </StyledBTC.FeeButton>
              </Col>
            </Row>
            {renderFeeError}
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
            <Form.Item name="memo">
              <Input size="large" disabled={isLoading} />
            </Form.Item>
            <Form.Item name="feeRate">{renderFeeOptions}</Form.Item>
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

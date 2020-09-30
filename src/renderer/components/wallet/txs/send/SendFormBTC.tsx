import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { FeeOptionsKey } from '@thorchain/asgardex-bitcoin/lib/types/client-types'
import {
  assetAmount,
  AssetBTC,
  assetToBase,
  assetToString,
  baseAmount,
  baseToAsset,
  bn,
  formatAssetAmountCurrency
} from '@thorchain/asgardex-util'
import { Row, Form, Radio } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { ZERO_BN } from '../../../../const'
import { BTC_DECIMAL } from '../../../../helpers/assetHelper'
import { AddressValidation, FeesRD, SendTxParams } from '../../../../services/bitcoin/types'
import { AssetsWithBalance, AssetWithBalance } from '../../../../services/wallet/types'
import { Input, InputBigNumber } from '../../../uielements/input'
import AccountSelector from '../../AccountSelector'
import * as Styled from '../Form.style'
import { validateTxAmountInput } from '../util'
import useChangeAssetHandler from './useChangeAssetHandler'

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
}

const SendFormBTC: React.FC<Props> = (props): JSX.Element => {
  const { onSubmit, assetsWB, assetWB, addressValidation, isLoading, fees: feesRD } = props

  const changeAssetHandler = useChangeAssetHandler()

  const intl = useIntl()

  const [selectedFeeKey, setSelectedFeeKey] = useState<FeeOptionsKey>('fast')

  const [form] = Form.useForm<FormValues>()

  const feesAvailable = useMemo(() => RD.isSuccess(feesRD), [feesRD])

  const selectedFeeOption = useMemo(
    () =>
      FP.pipe(
        feesRD,
        RD.toOption,
        O.map((fees) => fees[selectedFeeKey])
      ),
    [feesRD, selectedFeeKey]
  )

  const oFeeTotalBaseAmount = useMemo(
    () =>
      FP.pipe(
        feesRD,
        RD.toOption,
        // transformation: number -> BaseAmount -> AssetAmount
        O.map((fees) => baseAmount(fees[selectedFeeKey].feeTotal, BTC_DECIMAL))
      ),
    [feesRD, selectedFeeKey]
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
          () => '...',
          (error) => `${intl.formatMessage({ id: 'common.error' })} ${error?.message ?? ''}`,
          (fees) =>
            formatAssetAmountCurrency(
              baseToAsset(baseAmount(fees[selectedFeeKey].feeTotal, BTC_DECIMAL)),
              assetToString(AssetBTC),
              BTC_DECIMAL
            )
        )
      ),
    [feesRD, intl, selectedFeeKey]
  )

  const renderFeeError = useMemo(() => {
    if (!isFeeError) return <></>

    const msg = intl.formatMessage(
      { id: 'wallet.errors.fee.notCovered' },
      {
        balance: formatAssetAmountCurrency(baseToAsset(assetWB.amount), assetToString(AssetBTC), BTC_DECIMAL)
      }
    )

    return (
      <Styled.StyledLabel size="big" color="error">
        {msg}
      </Styled.StyledLabel>
    )
  }, [assetWB.amount, intl, isFeeError])

  const renderFeeOptions = useMemo(
    () =>
      FP.pipe(
        feesRD,
        RD.toOption,
        O.fold(
          () => <></>,
          (fees) => {
            const onChangeHandler = (e: RadioChangeEvent) => setSelectedFeeKey(e.target.value)
            return (
              <Radio.Group onChange={onChangeHandler} value={selectedFeeKey} disabled={isLoading}>
                {Object.keys(fees).map((key) => (
                  <Radio value={key as FeeOptionsKey} key={key}>
                    {key}
                  </Radio>
                ))}
              </Radio.Group>
            )
          }
        )
      ),
    [feesRD, isLoading, selectedFeeKey]
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
            <Styled.StyledLabel size="big" style={{ marginBottom: 0, paddingBottom: 0 }}>
              {intl.formatMessage({ id: 'common.max' })}:{' '}
              {formatAssetAmountCurrency(baseToAsset(assetWB.amount), assetToString(assetWB.asset), BTC_DECIMAL)}
            </Styled.StyledLabel>
            <Styled.StyledLabel size="big" color={RD.isFailure(feesRD) ? 'error' : 'primary'} style={{ paddingTop: 0 }}>
              {intl.formatMessage({ id: 'common.fees' })}: {selectedFeeLabel}
            </Styled.StyledLabel>
            {renderFeeError}
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
            <Form.Item name="memo">
              <Input size="large" disabled={isLoading} />
            </Form.Item>
            <Form.Item name="feeRate">{renderFeeOptions}</Form.Item>
          </Styled.SubForm>
          <Styled.SubmitItem>
            <Styled.Button loading={isLoading} disabled={!feesAvailable} htmlType="submit">
              {intl.formatMessage({ id: 'wallet.action.send' })}
            </Styled.Button>
          </Styled.SubmitItem>
        </Styled.Form>
      </Styled.Col>
    </Row>
  )
}

export default SendFormBTC

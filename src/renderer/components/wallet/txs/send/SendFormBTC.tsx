import React, { useCallback, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { FeeOptionsKey } from '@thorchain/asgardex-bitcoin/lib/types/client-types'
import {
  assetAmount,
  AssetBTC,
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

const SendFormBTC: React.FC<Props> = (props: Props): JSX.Element => {
  const { onSubmit, assetsWB, assetWB, addressValidation, isLoading, fees: feesRD } = props

  const changeAssetHandler = useChangeAssetHandler()

  const intl = useIntl()

  const [selectedFeeKey, setSelectedFeeKey] = useState<FeeOptionsKey>('fast')

  const [form] = Form.useForm<FormValues>()

  const feesAvailable = useMemo(() => !RD.isSuccess(feesRD), [feesRD])

  const selectedFeeRate = useMemo(
    () =>
      FP.pipe(
        feesRD,
        RD.toOption,
        O.map((fees) => fees[selectedFeeKey].feeRate)
      ),
    [feesRD, selectedFeeKey]
  )

  const selectedFeeLabel = useMemo(
    () =>
      FP.pipe(
        feesRD,
        RD.fold(
          () => '--',
          // TODO(@Veado) i18n
          () => 'loading',
          () => 'error',
          (fees) =>
            formatAssetAmountCurrency(
              baseToAsset(baseAmount(fees[selectedFeeKey].feeRate)),
              assetToString(AssetBTC),
              BTC_DECIMAL
            )
        )
      ),
    [feesRD, selectedFeeKey]
  )

  const renderFeeOptions = useMemo(
    () =>
      FP.pipe(
        feesRD,
        RD.fold(
          () => <></>,
          () => <>...</>,
          (_) => <>error</>,
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
        selectedFeeRate,
        O.map((feeRate) => assetWB.amount.amount().minus(feeRate)),
        // Set maxAmount to zero as long as we dont know about feeRate
        O.getOrElse(() => ZERO_BN),
        assetAmount
      )

      // error messages
      const errors = {
        msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
        msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
        msg3: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalanceAndFee' })
      }
      return validateTxAmountInput({ input: value, maxAmount, errors })
    },
    [assetWB.amount, intl, selectedFeeRate]
  )

  const onFinishHandler = useCallback(
    ({ amount, recipient, memo, feeRate = 0 }: FormValues) => {
      onSubmit({ to: recipient, amount: assetAmount(amount), feeRate, memo })
    },
    [onSubmit]
  )

  return (
    <Row>
      <Styled.Col span={24}>
        <AccountSelector onChange={changeAssetHandler} selectedAsset={assetWB.asset} assets={assetsWB} />
        <Styled.Form
          form={form}
          initialValues={{ amount: bn(0) }}
          onFinish={onFinishHandler}
          labelCol={{ span: 24 }}
          style={{ padding: '30px' }}>
          <Styled.SubForm>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.address' })}</Styled.CustomLabel>
            <Form.Item rules={[{ required: true, validator: addressValidator }]} name="recipient">
              <Input color="primary" size="large" disabled={isLoading} />
            </Form.Item>
            <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
            <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
              <InputBigNumber min={0} size="large" disabled={isLoading} decimal={8} />
            </Styled.FormItem>
            <Styled.StyledLabel size="big">
              <>
                {intl.formatMessage({ id: 'common.max' })}:{' '}
                {formatAssetAmountCurrency(baseToAsset(assetWB.amount), assetToString(assetWB.asset), BTC_DECIMAL)}
                <br />
                {intl.formatMessage({ id: 'common.fees' })}: {selectedFeeLabel}
              </>
            </Styled.StyledLabel>
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

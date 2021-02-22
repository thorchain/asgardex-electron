import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { FeesWithRates } from '@xchainjs/xchain-bitcoin/lib/types/client-types'
import { FeeOptionKey } from '@xchainjs/xchain-client'
import {
  assetAmount,
  AssetBTC,
  assetToBase,
  BaseAmount,
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

import { Network } from '../../../../../shared/api/types'
import { ZERO_BN } from '../../../../const'
import { BTC_DECIMAL } from '../../../../helpers/assetHelper'
import { AddressValidation, FeesWithRatesRD } from '../../../../services/bitcoin/types'
import { SendTxParams } from '../../../../services/chain/types'
import { WalletBalances } from '../../../../services/clients'
import { ValidatePasswordHandler } from '../../../../services/wallet/types'
import { TxTypes } from '../../../../types/asgardex'
import { WalletBalance } from '../../../../types/wallet'
import { PasswordModal } from '../../../modal/password'
import * as StyledR from '../../../shared/form/Radio.style'
import { Input, InputBigNumber } from '../../../uielements/input'
import { AccountSelector } from '../../account'
import * as Styled from '../TxForm.style'
import { validateTxAmountInput } from '../TxForm.util'
import { DEFAULT_FEE_OPTION_KEY } from './Send.const'
import { useChangeAssetHandler } from './Send.hooks'
import * as StyledForm from './SendForm.style'

export type FormValues = {
  recipient: string
  amount: string
  memo?: string
  feeRate?: number
}

export type Props = {
  balances: WalletBalances
  walletBalance: WalletBalance
  onSubmit: (p: SendTxParams) => void
  isLoading: boolean
  sendTxStatusMsg: string
  addressValidation: AddressValidation
  feesWithRates: FeesWithRatesRD
  reloadFeesHandler: FP.Lazy<void>
  validatePassword$: ValidatePasswordHandler
  network: Network
}

export const SendFormBTC: React.FC<Props> = (props): JSX.Element => {
  const {
    balances,
    walletBalance,
    onSubmit,
    isLoading,
    sendTxStatusMsg,
    addressValidation,
    feesWithRates: feesWithRatesRD,
    reloadFeesHandler,
    validatePassword$,
    network
  } = props

  const changeAssetHandler = useChangeAssetHandler()

  const intl = useIntl()

  const [selectedFeeOptionKey, setSelectedFeeOptionKey] = useState<FeeOptionKey>(DEFAULT_FEE_OPTION_KEY)

  const [form] = Form.useForm<FormValues>()

  const prevFeesWithRatesRef = useRef<O.Option<FeesWithRates>>(O.none)

  const oFeesWithRates: O.Option<FeesWithRates> = useMemo(() => FP.pipe(feesWithRatesRD, RD.toOption), [
    feesWithRatesRD
  ])

  const feesAvailable = useMemo(() => O.isSome(oFeesWithRates), [oFeesWithRates])

  // Store latest fees as `ref`
  // needed to display previous fee while reloading
  useEffect(() => {
    FP.pipe(
      oFeesWithRates,
      O.map((feesWithRates) => (prevFeesWithRatesRef.current = O.some(feesWithRates)))
    )
  }, [oFeesWithRates])

  const selectedFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        oFeesWithRates,
        O.map(({ fees }) => fees[selectedFeeOptionKey])
      ),
    [oFeesWithRates, selectedFeeOptionKey]
  )

  const oFeeBaseAmount: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        oFeesWithRates,
        O.map(({ fees }) => fees[selectedFeeOptionKey])
      ),
    [oFeesWithRates, selectedFeeOptionKey]
  )

  const isFeeError = useMemo(() => {
    return FP.pipe(
      oFeeBaseAmount,
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => false,
        (fee) => walletBalance.amount.amount().isLessThan(fee.amount())
      )
    )
  }, [walletBalance.amount, oFeeBaseAmount])

  const selectedFeeLabel = useMemo(
    () =>
      FP.pipe(
        feesWithRatesRD,
        RD.fold(
          () => '...',
          () =>
            // show previous fees while re-loading
            FP.pipe(
              prevFeesWithRatesRef.current,
              O.map(({ fees }) =>
                formatAssetAmountCurrency({
                  amount: baseToAsset(fees[selectedFeeOptionKey]),
                  asset: AssetBTC,
                  trimZeros: true
                })
              ),
              O.getOrElse(() => '...')
            ),
          (error) => `${intl.formatMessage({ id: 'common.error' })} ${error?.message ?? ''}`,
          ({ fees }) =>
            formatAssetAmountCurrency({
              amount: baseToAsset(fees[selectedFeeOptionKey]),
              asset: AssetBTC,
              trimZeros: true
            })
        )
      ),
    [feesWithRatesRD, intl, selectedFeeOptionKey]
  )

  const renderFeeError = useMemo(() => {
    if (!isFeeError) return <></>

    const msg = intl.formatMessage(
      { id: 'wallet.errors.fee.notCovered' },
      {
        balance: formatAssetAmountCurrency({
          amount: baseToAsset(walletBalance.amount),
          asset: AssetBTC,
          trimZeros: true
        })
      }
    )

    return (
      <Styled.Label size="big" color="error">
        {msg}
      </Styled.Label>
    )
  }, [walletBalance.amount, intl, isFeeError])

  const feeOptionsLabel: Record<FeeOptionKey, string> = useMemo(
    () => ({
      fast: intl.formatMessage({ id: 'wallet.send.fast' }),
      fastest: intl.formatMessage({ id: 'wallet.send.fastest' }),
      average: intl.formatMessage({ id: 'wallet.send.average' })
    }),
    [intl]
  )

  const renderFeeOptionsRadioGroup = useCallback(
    ({ rates }: FeesWithRates) => {
      const onChangeHandler = (e: RadioChangeEvent) => setSelectedFeeOptionKey(e.target.value)
      return (
        <StyledR.Radio.Group onChange={onChangeHandler} value={selectedFeeOptionKey} disabled={isLoading}>
          {Object.keys(rates).map((key) => (
            <StyledR.Radio value={key as FeeOptionKey} key={key}>
              <StyledR.RadioLabel>{feeOptionsLabel[key as FeeOptionKey]}</StyledR.RadioLabel>
            </StyledR.Radio>
          ))}
        </StyledR.Radio.Group>
      )
    },

    [feeOptionsLabel, isLoading, selectedFeeOptionKey]
  )

  const renderFeeOptions = useMemo(
    () =>
      FP.pipe(
        oFeesWithRates,
        O.fold(
          () =>
            // render radio group while reloading fees
            FP.pipe(
              prevFeesWithRatesRef.current,
              O.map(renderFeeOptionsRadioGroup),
              O.getOrElse(() => <></>)
            ),
          renderFeeOptionsRadioGroup
        )
      ),
    [prevFeesWithRatesRef, oFeesWithRates, renderFeeOptionsRadioGroup]
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

  const maxAmount = useMemo(
    () =>
      FP.pipe(
        selectedFee,
        O.map((fee) => walletBalance.amount.amount().minus(fee.amount())),
        // Set maxAmount to zero as long as we dont have a feeRate
        O.getOrElse(() => ZERO_BN),
        baseAmount,
        baseToAsset
      ),
    [walletBalance.amount, selectedFee]
  )

  const amountValidator = useCallback(
    async (_: unknown, value: BigNumber) => {
      // error messages
      const errors = {
        msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
        msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
        msg3: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalanceAndFee' })
      }
      return validateTxAmountInput({ input: value, maxAmount, errors })
    },
    [intl, maxAmount]
  )

  // State for visibility of Modal to confirm tx
  const [showPwModal, setShowPwModal] = useState(false)

  const sendHandler = useCallback(() => {
    // close PW modal
    setShowPwModal(false)

    onSubmit({
      recipient: form.getFieldValue('recipient'),
      asset: walletBalance.asset,
      amount: assetToBase(assetAmount(form.getFieldValue('amount'))),
      feeOptionKey: selectedFeeOptionKey,
      memo: form.getFieldValue('memo'),
      txType: TxTypes.TRANSFER
    })
  }, [selectedFeeOptionKey, onSubmit, form, walletBalance])

  const renderPwModal = useMemo(
    () =>
      showPwModal ? (
        <PasswordModal
          onSuccess={sendHandler}
          onClose={() => setShowPwModal(false)}
          validatePassword$={validatePassword$}
        />
      ) : (
        <></>
      ),
    [sendHandler, showPwModal, validatePassword$]
  )

  return (
    <>
      <Row>
        <Styled.Col span={24}>
          <AccountSelector
            onChange={changeAssetHandler}
            selectedAsset={walletBalance.asset}
            walletBalances={balances}
            network={network}
          />
          <Styled.Form
            form={form}
            initialValues={{
              // default value for BigNumberInput
              amount: bn(0),
              // Default value for RadioGroup of feeOptions
              feeRate: DEFAULT_FEE_OPTION_KEY
            }}
            onFinish={() => setShowPwModal(true)}
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
                  amount: maxAmount,
                  asset: walletBalance.asset,
                  trimZeros: true
                })}
              </Styled.Label>
              <Row align="middle">
                <Col>
                  <StyledForm.FeeLabel
                    size="big"
                    color={RD.isFailure(feesWithRatesRD) ? 'error' : 'primary'}
                    style={{ paddingTop: 0 }}
                    disabled={RD.isPending(feesWithRatesRD)}>
                    {intl.formatMessage({ id: 'common.fees' })}: {selectedFeeLabel}
                  </StyledForm.FeeLabel>
                </Col>
                <Col>
                  <StyledForm.FeeButton onClick={reloadFeesHandler} disabled={RD.isPending(feesWithRatesRD)}>
                    <SyncOutlined />
                  </StyledForm.FeeButton>
                </Col>
              </Row>
              {renderFeeError}
              <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
              <Form.Item name="memo">
                <Input size="large" disabled={isLoading} />
              </Form.Item>
              <Form.Item name="feeRate">{renderFeeOptions}</Form.Item>
            </Styled.SubForm>
            <Styled.SubmitContainer>
              <Styled.SubmitStatus>{sendTxStatusMsg}</Styled.SubmitStatus>
              <Styled.Button loading={isLoading} disabled={!feesAvailable || isLoading} htmlType="submit">
                {intl.formatMessage({ id: 'wallet.action.send' })}
              </Styled.Button>
            </Styled.SubmitContainer>
          </Styled.Form>
        </Styled.Col>
      </Row>
      {renderPwModal}
    </>
  )
}

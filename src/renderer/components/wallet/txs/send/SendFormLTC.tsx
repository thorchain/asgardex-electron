import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address, FeeOption, FeesWithRates } from '@xchainjs/xchain-client'
import { LTC_DECIMAL } from '@xchainjs/xchain-litecoin'
import {
  assetAmount,
  AssetLTC,
  assetToBase,
  BaseAmount,
  baseAmount,
  baseToAsset,
  bn,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
import { Row, Form } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { WalletType } from '../../../../../shared/wallet/types'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../../const'
import { Memo, SendTxParams } from '../../../../services/chain/types'
import { AddressValidation, WalletBalances } from '../../../../services/clients'
import { FeesWithRatesRD } from '../../../../services/litecoin/types'
import { ValidatePasswordHandler } from '../../../../services/wallet/types'
import { WalletBalance } from '../../../../services/wallet/types'
import { PasswordModal } from '../../../modal/password'
import * as StyledR from '../../../shared/form/Radio.styles'
import { MaxBalanceButton } from '../../../uielements/button/MaxBalanceButton'
import { UIFeesRD } from '../../../uielements/fees'
import { Input, InputBigNumber } from '../../../uielements/input'
import { AccountSelector } from '../../account'
import * as H from '../TxForm.helpers'
import * as Styled from '../TxForm.styles'
import { validateTxAmountInput } from '../TxForm.util'
import { DEFAULT_FEE_OPTION } from './Send.const'
import { useChangeAssetHandler } from './Send.hooks'

export type FormValues = {
  recipient: string
  amount: BigNumber
  memo?: string
  feeRate?: number
}

export type Props = {
  walletType: WalletType
  walletIndex: number
  balances: WalletBalances
  balance: WalletBalance
  onSubmit: (p: SendTxParams) => void
  isLoading: boolean
  sendTxStatusMsg: string
  addressValidation: AddressValidation
  feesWithRates: FeesWithRatesRD
  reloadFeesHandler: (memo?: Memo) => void
  validatePassword$: ValidatePasswordHandler
  network: Network
}

export const SendFormLTC: React.FC<Props> = (props): JSX.Element => {
  const {
    walletType,
    walletIndex,
    balances,
    balance,
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

  const [selectedFeeOption, setSelectedFeeOption] = useState<FeeOption>(DEFAULT_FEE_OPTION)

  const [form] = Form.useForm<FormValues>()

  const prevFeesWithRatesRef = useRef<O.Option<FeesWithRates>>(O.none)

  const oFeesWithRates: O.Option<FeesWithRates> = useMemo(
    () => FP.pipe(feesWithRatesRD, RD.toOption),
    [feesWithRatesRD]
  )

  const [amountToSend, setAmountToSend] = useState<BaseAmount>(ZERO_BASE_AMOUNT)

  const feesAvailable = useMemo(() => O.isSome(oFeesWithRates), [oFeesWithRates])

  // Store latest fees as `ref`
  // needed to display previous fee while reloading
  useEffect(() => {
    FP.pipe(
      oFeesWithRates,
      O.map((feesWithRates) => (prevFeesWithRatesRef.current = O.some(feesWithRates)))
    )
  }, [oFeesWithRates])

  const prevSelectedFeeRef = useRef<O.Option<BaseAmount>>(O.none)

  const selectedFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        oFeesWithRates,
        O.map(({ fees }) => {
          const fee = fees[selectedFeeOption]
          prevSelectedFeeRef.current = O.some(fee)
          return fee
        })
      ),
    [oFeesWithRates, selectedFeeOption]
  )

  const oFeeBaseAmount: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        oFeesWithRates,
        O.map(({ fees }) => fees[selectedFeeOption])
      ),
    [oFeesWithRates, selectedFeeOption]
  )

  const isFeeError = useMemo(() => {
    return FP.pipe(
      oFeeBaseAmount,
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => false,
        (fee) => balance.amount.amount().isLessThan(fee.amount())
      )
    )
  }, [balance.amount, oFeeBaseAmount])

  const renderFeeError = useMemo(() => {
    if (!isFeeError) return <></>

    const msg = intl.formatMessage(
      { id: 'wallet.errors.fee.notCovered' },
      {
        balance: formatAssetAmountCurrency({
          amount: baseToAsset(balance.amount),
          asset: AssetLTC,
          trimZeros: true
        })
      }
    )

    return (
      <Styled.Label size="big" color="error">
        {msg}
      </Styled.Label>
    )
  }, [balance.amount, intl, isFeeError])

  const feeOptionsLabel: Record<FeeOption, string> = useMemo(
    () => ({
      [FeeOption.Fast]: intl.formatMessage({ id: 'wallet.send.fast' }),
      [FeeOption.Fastest]: intl.formatMessage({ id: 'wallet.send.fastest' }),
      [FeeOption.Average]: intl.formatMessage({ id: 'wallet.send.average' })
    }),
    [intl]
  )

  const renderFeeOptionsRadioGroup = useCallback(
    ({ rates }: FeesWithRates) => {
      const onChangeHandler = (e: RadioChangeEvent) => setSelectedFeeOption(e.target.value)
      return (
        <StyledR.Radio.Group onChange={onChangeHandler} value={selectedFeeOption} disabled={isLoading}>
          {Object.keys(rates).map((key) => (
            <StyledR.Radio value={key as FeeOption} key={key}>
              <StyledR.RadioLabel>{feeOptionsLabel[key as FeeOption]}</StyledR.RadioLabel>
            </StyledR.Radio>
          ))}
        </StyledR.Radio.Group>
      )
    },

    [feeOptionsLabel, isLoading, selectedFeeOption]
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
      if (!addressValidation(value)) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.address.invalid' }))
      }
    },
    [addressValidation, intl]
  )

  const maxAmount: BaseAmount = useMemo(
    () =>
      FP.pipe(
        selectedFee,
        O.alt(() => prevSelectedFeeRef.current),
        O.map((fee) => balance.amount.amount().minus(fee.amount())),
        // Set maxAmount to zero as long as we dont have a feeRate
        O.getOrElse(() => ZERO_BN),
        baseAmount
      ),
    [balance.amount, selectedFee]
  )

  const isMaxButtonDisabled = useMemo(
    () =>
      isLoading ||
      FP.pipe(
        selectedFee,
        O.fold(
          () => true,
          () => false
        )
      ),
    [isLoading, selectedFee]
  )

  const amountValidator = useCallback(
    async (_: unknown, value: BigNumber) => {
      // error messages
      const errors = {
        msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
        msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
        msg3: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalanceAndFee' })
      }
      return validateTxAmountInput({ input: value, maxAmount: baseToAsset(maxAmount), errors })
    },
    [intl, maxAmount]
  )

  // State for visibility of Modal to confirm tx
  const [showPwModal, setShowPwModal] = useState(false)

  const sendHandler = useCallback(() => {
    // close PW modal
    setShowPwModal(false)

    onSubmit({
      walletType,
      walletIndex,
      recipient: form.getFieldValue('recipient'),
      asset: balance.asset,
      amount: amountToSend,
      feeOption: selectedFeeOption,
      memo: form.getFieldValue('memo')
    })
  }, [onSubmit, walletType, walletIndex, form, balance.asset, amountToSend, selectedFeeOption])

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

  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        feesWithRatesRD,
        RD.map((fees) => [{ asset: AssetLTC, amount: fees.fees[selectedFeeOption] }])
      ),

    [feesWithRatesRD, selectedFeeOption]
  )

  const reloadFees = useCallback(() => {
    reloadFeesHandler(form.getFieldValue('memo'))
  }, [form, reloadFeesHandler])

  const addMaxAmountHandler = useCallback(() => setAmountToSend(maxAmount), [maxAmount])

  const onChangeInput = useCallback(
    async (value: BigNumber) => {
      // we have to validate input before storing into the state
      amountValidator(undefined, value)
        .then(() => {
          setAmountToSend(assetToBase(assetAmount(value)))
        })
        .catch(() => {}) // do nothing, Ant' form does the job for us to show an error message
    },
    [amountValidator]
  )

  useEffect(() => {
    // Whenever `amountToSend` has been updated, we put it back into input field
    form.setFieldsValue({
      amount: baseToAsset(amountToSend).amount()
    })
  }, [amountToSend, form])

  const [recipientAddress, setRecipientAddress] = useState<Address>('')
  const handleOnKeyUp = useCallback(() => {
    setRecipientAddress(form.getFieldValue('recipient'))
  }, [form])

  const oMatchedWalletType: O.Option<WalletType> = useMemo(
    () => H.matchedWalletType(balances, recipientAddress),
    [balances, recipientAddress]
  )

  const renderWalletType = useMemo(() => H.renderedWalletType(oMatchedWalletType), [oMatchedWalletType])

  return (
    <>
      <Row>
        <Styled.Col span={24}>
          <AccountSelector
            onChange={changeAssetHandler}
            selectedWallet={balance}
            walletBalances={balances}
            network={network}
          />
          <Styled.Form
            form={form}
            initialValues={{
              // default value for BigNumberInput
              amount: bn(0),
              // Default value for RadioGroup of feeOptions
              feeRate: DEFAULT_FEE_OPTION
            }}
            onFinish={() => setShowPwModal(true)}
            labelCol={{ span: 24 }}>
            <Styled.SubForm>
              <Styled.CustomLabel size="big">
                {intl.formatMessage({ id: 'common.address' })}
                {renderWalletType}
              </Styled.CustomLabel>
              <Form.Item rules={[{ required: true, validator: addressValidator }]} name="recipient">
                <Input color="primary" size="large" disabled={isLoading} onKeyUp={handleOnKeyUp} />
              </Form.Item>
              <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
              <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
                <InputBigNumber
                  min={0}
                  size="large"
                  disabled={isLoading}
                  decimal={LTC_DECIMAL}
                  onChange={onChangeInput}
                />
              </Styled.FormItem>
              <MaxBalanceButton
                balance={{ amount: maxAmount, asset: AssetLTC }}
                onClick={addMaxAmountHandler}
                disabled={isMaxButtonDisabled}
              />
              <Styled.Fees fees={uiFeesRD} reloadFees={reloadFees} disabled={isLoading} />
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

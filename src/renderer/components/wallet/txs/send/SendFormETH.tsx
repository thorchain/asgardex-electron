import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { FeeOption, Fees, TxParams } from '@xchainjs/xchain-client'
import { Address, validateAddress } from '@xchainjs/xchain-ethereum'
import {
  formatAssetAmountCurrency,
  bn,
  baseToAsset,
  AssetETH,
  BaseAmount,
  baseAmount,
  assetToBase,
  assetAmount
} from '@xchainjs/xchain-util'
import { Row, Form } from 'antd'
import { RadioChangeEvent } from 'antd/lib/radio'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../../const'
import { isEthAsset } from '../../../../helpers/assetHelper'
import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { getEthAmountFromBalances } from '../../../../helpers/walletHelper'
import { SendTxParams } from '../../../../services/chain/types'
import { FeesRD, WalletBalances } from '../../../../services/clients'
import { ValidatePasswordHandler } from '../../../../services/wallet/types'
import { WalletBalance } from '../../../../services/wallet/types'
import { PasswordModal } from '../../../modal/password'
import * as StyledR from '../../../shared/form/Radio.styles'
import { MaxBalanceButton } from '../../../uielements/button/MaxBalanceButton'
import { UIFeesRD } from '../../../uielements/fees'
import { Input, InputBigNumber } from '../../../uielements/input'
import { AccountSelector } from '../../account'
import * as Styled from '../TxForm.styles'
import { validateTxAmountInput } from '../TxForm.util'
import { DEFAULT_FEE_OPTION } from './Send.const'
import { useChangeAssetHandler } from './Send.hooks'

export type FormValues = {
  recipient: Address
  amount: BigNumber
  memo?: string
}

export type Props = {
  balances: WalletBalances
  balance: WalletBalance
  onSubmit: (p: SendTxParams) => void
  isLoading: boolean
  sendTxStatusMsg: string
  fees: FeesRD
  reloadFeesHandler: (params: TxParams) => void
  validatePassword$: ValidatePasswordHandler
  network: Network
}

export const SendFormETH: React.FC<Props> = (props): JSX.Element => {
  const {
    balances,
    balance,
    onSubmit,
    isLoading,
    sendTxStatusMsg,
    fees: feesRD,
    reloadFeesHandler,
    validatePassword$,
    network
  } = props

  const intl = useIntl()

  const changeAssetHandler = useChangeAssetHandler()

  const [selectedFeeOption, setSelectedFeeOption] = useState<FeeOption>(DEFAULT_FEE_OPTION)

  const [amountToSend, setAmountToSend] = useState<O.Option<BaseAmount>>(O.none)
  const [sendAddress, setSendAddress] = useState<O.Option<Address>>(O.none)

  const [form] = Form.useForm<FormValues>()

  const prevFeesRef = useRef<O.Option<Fees>>(O.none)

  const oFees: O.Option<Fees> = useMemo(() => FP.pipe(feesRD, RD.toOption), [feesRD])

  const feesAvailable = useMemo(() => O.isSome(oFees), [oFees])

  // Store latest fees as `ref`
  // needed to display previous fee while reloading
  useEffect(() => {
    FP.pipe(
      oFees,
      O.map((fees) => (prevFeesRef.current = O.some(fees)))
    )
  }, [oFees])

  const selectedFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        oFees,
        O.map((fees) => fees[selectedFeeOption])
      ),
    [oFees, selectedFeeOption]
  )

  const oEthAmount: O.Option<BaseAmount> = useMemo(() => {
    // return balance of current asset (if ETH)
    if (isEthAsset(balance.asset)) {
      return O.some(balance.amount)
    }
    // or check list of other assets to get eth balance
    return FP.pipe(balances, getEthAmountFromBalances, O.map(assetToBase))
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

  const renderFeeError = useMemo(() => {
    if (!isFeeError) return <></>

    const amount: BaseAmount = FP.pipe(
      oEthAmount,
      // no eth asset == zero amount
      O.getOrElse(() => ZERO_BASE_AMOUNT)
    )

    const msg = intl.formatMessage(
      { id: 'wallet.errors.fee.notCovered' },
      {
        balance: formatAssetAmountCurrency({
          amount: baseToAsset(amount),
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

  const feeOptionsLabel: Record<FeeOption, string> = useMemo(
    () => ({
      [FeeOption.Fast]: intl.formatMessage({ id: 'wallet.send.fast' }),
      [FeeOption.Fastest]: intl.formatMessage({ id: 'wallet.send.fastest' }),
      [FeeOption.Average]: intl.formatMessage({ id: 'wallet.send.average' })
    }),
    [intl]
  )

  const renderFeeOptions = useMemo(() => {
    const onChangeHandler = (e: RadioChangeEvent) => setSelectedFeeOption(e.target.value)
    const disabled = !feesAvailable || isLoading

    return (
      <StyledR.Radio.Group onChange={onChangeHandler} value={selectedFeeOption} disabled={disabled}>
        <StyledR.Radio value="fastest" key="fastest">
          <StyledR.RadioLabel disabled={disabled}>{feeOptionsLabel['fastest']}</StyledR.RadioLabel>
        </StyledR.Radio>
        <StyledR.Radio value="fast" key="fast">
          <StyledR.RadioLabel disabled={disabled}>{feeOptionsLabel['fast']}</StyledR.RadioLabel>
        </StyledR.Radio>
        <StyledR.Radio value="average" key="average">
          <StyledR.RadioLabel disabled={disabled}>{feeOptionsLabel['average']}</StyledR.RadioLabel>
        </StyledR.Radio>
      </StyledR.Radio.Group>
    )
  }, [feeOptionsLabel, feesAvailable, isLoading, selectedFeeOption])

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
  const maxAmount: BaseAmount = useMemo(() => {
    const maxEthAmount: BigNumber = FP.pipe(
      sequenceTOption(selectedFee, oEthAmount),
      O.fold(
        // Set maxAmount to zero if we dont know anything about eth and fee amounts
        () => ZERO_BN,
        ([fee, ethAmount]) => {
          const max = ethAmount.amount().minus(fee.amount())
          return max.isGreaterThan(0) ? max : ZERO_BN
        }
      )
    )
    return isEthAsset(balance.asset) ? baseAmount(maxEthAmount, balance.amount.decimal) : balance.amount
  }, [selectedFee, oEthAmount, balance])

  useEffect(() => {
    // Whenever `amountToSend` has been updated, we put it back into input field
    FP.pipe(
      amountToSend,
      O.map((amount) =>
        form.setFieldsValue({
          amount: baseToAsset(amount).amount()
        })
      )
    )
  }, [amountToSend, form])

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
      return validateTxAmountInput({ input: value, maxAmount: baseToAsset(maxAmount), errors })
    },
    [balance, intl, maxAmount]
  )

  const onChangeInput = useCallback(
    async (value: BigNumber) => {
      // we have to validate input before storing into the state
      amountValidator(undefined, value)
        .then(() => {
          setAmountToSend(O.some(assetToBase(assetAmount(value, balance.amount.decimal))))
        })
        .catch(() => setAmountToSend(O.none))
    },
    [amountValidator, balance.amount.decimal]
  )

  const onChangeAddress = useCallback(
    async ({ target }: React.ChangeEvent<HTMLInputElement>) => {
      const address = target.value
      // we have to validate input before storing into the state
      addressValidator(undefined, address)
        .then(() => {
          setSendAddress(O.some(address))
        })
        .catch(() => setSendAddress(O.none))
    },
    [setSendAddress, addressValidator]
  )

  const reloadFees = useCallback(() => {
    FP.pipe(
      sequenceTOption(amountToSend, sendAddress),
      O.map(([amount, recipient]) => {
        reloadFeesHandler({ asset: balance.asset, amount, recipient, memo: form.getFieldValue('memo') })
        return true
      })
    )

    return false
  }, [amountToSend, sendAddress, reloadFeesHandler, balance.asset, form])

  // State for visibility of Modal to confirm tx
  const [showPwModal, setShowPwModal] = useState(false)

  const sendHandler = useCallback(() => {
    // close PW modal
    setShowPwModal(false)

    FP.pipe(
      sequenceTOption(amountToSend, sendAddress),
      O.map(([amount, recipient]) => {
        onSubmit({
          recipient,
          asset: balance.asset,
          amount,
          feeOption: selectedFeeOption,
          memo: form.getFieldValue('memo')
        })
        return true
      })
    )
  }, [balance.asset, form, onSubmit, selectedFeeOption, sendAddress, amountToSend])

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
        feesRD,
        RD.map((fees) => [{ asset: AssetETH, amount: fees[selectedFeeOption] }])
      ),
    [feesRD, selectedFeeOption]
  )

  const addMaxAmountHandler = useCallback(() => setAmountToSend(O.some(maxAmount)), [maxAmount])

  return (
    <>
      <Row>
        <Styled.Col span={24}>
          <AccountSelector
            onChange={changeAssetHandler}
            selectedAsset={balance.asset}
            walletBalances={balances}
            network={network}
          />
          <Styled.Form
            form={form}
            initialValues={{
              // default value for BigNumberInput
              amount: bn(0),
              // Default value for RadioGroup of feeOptions
              fee: DEFAULT_FEE_OPTION
            }}
            onFinish={() => setShowPwModal(true)}
            labelCol={{ span: 24 }}>
            <Styled.SubForm>
              <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.address' })}</Styled.CustomLabel>
              <Form.Item rules={[{ required: true, validator: addressValidator }]} name="recipient">
                <Input
                  color="primary"
                  size="large"
                  disabled={isLoading}
                  onBlur={reloadFees}
                  onChange={onChangeAddress}
                />
              </Form.Item>
              <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
              <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
                <InputBigNumber
                  min={0}
                  size="large"
                  disabled={isLoading}
                  decimal={balance.amount.decimal}
                  onBlur={reloadFees}
                  onChange={onChangeInput}
                />
              </Styled.FormItem>
              <MaxBalanceButton
                balance={{ amount: maxAmount, asset: balance.asset }}
                onClick={addMaxAmountHandler}
                disabled={isLoading}
              />
              <Styled.Fees fees={uiFeesRD} reloadFees={reloadFees} disabled={isLoading} />
              {renderFeeError}
              <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
              <Form.Item name="memo">
                <Input size="large" disabled={isLoading} onBlur={reloadFees} />
              </Form.Item>
              <Form.Item name="fee">{renderFeeOptions}</Form.Item>
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

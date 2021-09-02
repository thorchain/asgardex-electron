import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-binance'
import {
  formatAssetAmountCurrency,
  assetAmount,
  bn,
  baseToAsset,
  AssetBNB,
  assetToBase,
  BaseAmount,
  baseAmount
} from '@xchainjs/xchain-util'
import { Row, Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { ZERO_BASE_AMOUNT } from '../../../../const'
import { isBnbAsset } from '../../../../helpers/assetHelper'
import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { getBnbAmountFromBalances } from '../../../../helpers/walletHelper'
import { FeeRD, SendTxParams } from '../../../../services/chain/types'
import { AddressValidation, WalletBalances } from '../../../../services/clients'
import { ValidatePasswordHandler } from '../../../../services/wallet/types'
import { WalletBalance } from '../../../../services/wallet/types'
import { PasswordModal } from '../../../modal/password'
import { MaxBalanceButton } from '../../../uielements/button/MaxBalanceButton'
import { UIFeesRD } from '../../../uielements/fees'
import { Input, InputBigNumber } from '../../../uielements/input'
import { AccountSelector } from '../../account'
import * as Styled from '../TxForm.styles'
import { validateTxAmountInput } from '../TxForm.util'
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
  addressValidation: AddressValidation
  fee: FeeRD
  reloadFeesHandler: FP.Lazy<void>
  validatePassword$: ValidatePasswordHandler
  network: Network
}

export const SendFormBNB: React.FC<Props> = (props): JSX.Element => {
  const {
    balances,
    balance,
    onSubmit,
    isLoading,
    sendTxStatusMsg,
    addressValidation,
    fee: feeRD,
    reloadFeesHandler,
    validatePassword$,
    network
  } = props

  const intl = useIntl()

  const changeAssetHandler = useChangeAssetHandler()

  const [amountToSend, setAmountToSend] = useState<BaseAmount>(ZERO_BASE_AMOUNT)

  const [form] = Form.useForm<FormValues>()

  const oBnbAmount: O.Option<BaseAmount> = useMemo(() => {
    // return balance of current asset (if BNB)
    if (isBnbAsset(balance.asset)) {
      return O.some(balance.amount)
    }
    // or check list of other assets to get bnb balance
    return FP.pipe(balances, getBnbAmountFromBalances, O.map(assetToBase))
  }, [balance, balances])

  const oFee: O.Option<BaseAmount> = useMemo(() => FP.pipe(feeRD, RD.toOption), [feeRD])

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

    const amount: BaseAmount = FP.pipe(
      oBnbAmount,
      // no bnb asset == zero amount
      O.getOrElse(() => ZERO_BASE_AMOUNT)
    )

    const msg = intl.formatMessage(
      { id: 'wallet.errors.fee.notCovered' },
      {
        balance: formatAssetAmountCurrency({ amount: baseToAsset(amount), asset: AssetBNB, trimZeros: true })
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

  const maxAmount: BaseAmount = useMemo(() => {
    const maxBnbAmount = FP.pipe(
      sequenceTOption(oFee, oBnbAmount),
      O.fold(
        // Set maxAmount to zero if we dont know anything about bnb and fee amounts
        () => ZERO_BASE_AMOUNT,
        ([fee, bnbAmount]) => baseAmount(bnbAmount.amount().minus(fee.amount()))
      )
    )
    return isBnbAsset(balance.asset) ? maxBnbAmount : balance.amount
  }, [oFee, oBnbAmount, balance])

  useEffect(() => {
    // Whenever `amountToSend` has been updated, we put it back into input field
    form.setFieldsValue({
      amount: baseToAsset(amountToSend).amount()
    })
  }, [amountToSend, form])

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
      return validateTxAmountInput({ input: value, maxAmount: baseToAsset(maxAmount), errors })
    },
    [balance, intl, maxAmount]
  )

  // State for visibility of Modal to confirm tx
  const [showPwModal, setShowPwModal] = useState(false)

  const sendHandler = useCallback(() => {
    // close PW modal
    setShowPwModal(false)

    onSubmit({
      // TODO(@asgdx-team) Get `walletType` from props if we want to support other than keystore (e.g. Ledger)
      walletType: 'keystore',
      recipient: form.getFieldValue('recipient'),
      asset: balance.asset,
      amount: amountToSend,
      memo: form.getFieldValue('memo')
    })
  }, [onSubmit, form, balance.asset, amountToSend])

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
        feeRD,
        RD.map((fee) => [{ asset: AssetBNB, amount: fee }])
      ),

    [feeRD]
  )

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

  const addMaxAmountHandler = useCallback(() => setAmountToSend(maxAmount), [maxAmount])

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
            initialValues={{ amount: bn(0) }}
            onFinish={() => setShowPwModal(true)}
            labelCol={{ span: 24 }}>
            <Styled.SubForm>
              <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.address' })}</Styled.CustomLabel>
              <Form.Item rules={[{ required: true, validator: addressValidator }]} name="recipient">
                <Input color="primary" size="large" disabled={isLoading} />
              </Form.Item>
              <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
              <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
                <InputBigNumber min={0} size="large" disabled={isLoading} decimal={8} onChange={onChangeInput} />
              </Styled.FormItem>
              <MaxBalanceButton
                balance={{ amount: maxAmount, asset: balance.asset }}
                onClick={addMaxAmountHandler}
                disabled={isLoading}
              />
              <Styled.Fees fees={uiFeesRD} reloadFees={reloadFeesHandler} disabled={isLoading} />
              {renderFeeError}
              <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
              <Form.Item name="memo">
                <Input size="large" disabled={isLoading} />
              </Form.Item>
            </Styled.SubForm>
            <Styled.SubmitContainer>
              <Styled.SubmitStatus>{sendTxStatusMsg}</Styled.SubmitStatus>
              <Styled.Button loading={isLoading} disabled={isFeeError} htmlType="submit">
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

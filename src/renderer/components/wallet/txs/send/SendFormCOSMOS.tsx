import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { COSMOS_DECIMAL } from '@xchainjs/xchain-cosmos'
import { Address, baseAmount } from '@xchainjs/xchain-util'
import {
  formatAssetAmountCurrency,
  assetAmount,
  bn,
  AssetRuneNative,
  assetToBase,
  BaseAmount,
  baseToAsset
} from '@xchainjs/xchain-util'
import { Row, Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { CosmosChain } from '../../../../../shared/utils/chain'
import { isKeystoreWallet, isLedgerWallet } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import { ZERO_BASE_AMOUNT } from '../../../../const'
import { isRuneNativeAsset } from '../../../../helpers/assetHelper'
import { useSubscriptionState } from '../../../../hooks/useSubscriptionState'
import { INITIAL_SEND_STATE } from '../../../../services/chain/const'
import { FeeRD, SendTxState, SendTxStateHandler } from '../../../../services/chain/types'
import { AddressValidation, GetExplorerTxUrl, OpenExplorerTxUrl, WalletBalances } from '../../../../services/clients'
import { SelectedWalletAsset, ValidatePasswordHandler } from '../../../../services/wallet/types'
import { WalletBalance } from '../../../../services/wallet/types'
import { LedgerConfirmationModal, WalletPasswordConfirmationModal } from '../../../modal/confirmation'
import { FlatButton } from '../../../uielements/button'
import { MaxBalanceButton } from '../../../uielements/button/MaxBalanceButton'
import { UIFeesRD } from '../../../uielements/fees'
import { Input, InputBigNumber } from '../../../uielements/input'
import { AccountSelector } from '../../account'
import * as H from '../TxForm.helpers'
import * as Styled from '../TxForm.styles'
import { validateTxAmountInput } from '../TxForm.util'
import * as Shared from './Send.shared'

export type FormValues = {
  recipient: string
  amount: BigNumber
  memo?: string
}

export type Props = {
  asset: SelectedWalletAsset
  balances: WalletBalances
  balance: WalletBalance
  transfer$: SendTxStateHandler
  openExplorerTxUrl: OpenExplorerTxUrl
  getExplorerTxUrl: GetExplorerTxUrl
  addressValidation: AddressValidation
  fee: FeeRD
  reloadFeesHandler: FP.Lazy<void>
  validatePassword$: ValidatePasswordHandler
  network: Network
}

export const SendFormCOSMOS: React.FC<Props> = (props): JSX.Element => {
  const {
    asset: { walletType, walletIndex, hdMode },
    balances,
    balance,
    transfer$,
    openExplorerTxUrl,
    getExplorerTxUrl,
    addressValidation,
    fee: feeRD,
    reloadFeesHandler,
    validatePassword$,
    network
  } = props

  const intl = useIntl()

  const { asset } = balance

  const [amountToSend, setAmountToSend] = useState<BaseAmount>(ZERO_BASE_AMOUNT)

  const {
    state: sendTxState,
    reset: resetSendTxState,
    subscribe: subscribeSendTxState
  } = useSubscriptionState<SendTxState>(INITIAL_SEND_STATE)

  const isLoading = useMemo(() => RD.isPending(sendTxState.status), [sendTxState.status])

  const [form] = Form.useForm<FormValues>()

  const oFee: O.Option<BaseAmount> = useMemo(() => FP.pipe(feeRD, RD.toOption), [feeRD])

  const isFeeError = useMemo(() => {
    return FP.pipe(
      oFee,
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFee),
        (fee) => balance.amount.amount().isLessThan(fee.amount())
      )
    )
  }, [balance.amount, oFee])

  const renderFeeError = useMemo(() => {
    if (!isFeeError) return <></>

    const msg = intl.formatMessage(
      { id: 'wallet.errors.fee.notCovered' },
      {
        balance: formatAssetAmountCurrency({
          amount: baseToAsset(balance.amount),
          asset: AssetRuneNative,
          trimZeros: true
        })
      }
    )

    return (
      <Styled.Label size="big" color="error">
        {msg}
      </Styled.Label>
    )
  }, [isFeeError, intl, balance.amount])

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

  // max amount for RuneNative
  const maxAmount: BaseAmount = useMemo(() => {
    const maxRuneAmount = FP.pipe(
      oFee,
      O.fold(
        // Set maxAmount to zero if we dont know anything about RuneNative and fee amounts
        () => ZERO_BASE_AMOUNT,
        (fee) => {
          const max = balance.amount.minus(fee)
          const zero = baseAmount(0, max.decimal)
          return max.gt(zero) ? max : zero
        }
      )
    )
    return isRuneNativeAsset(asset) ? maxRuneAmount : balance.amount
  }, [oFee, asset, balance.amount])

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
        msg3: isRuneNativeAsset(asset)
          ? intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalanceAndFee' })
          : intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' })
      }
      return validateTxAmountInput({ input: value, maxAmount: baseToAsset(maxAmount), errors })
    },
    [asset, intl, maxAmount]
  )

  // Send tx start time
  const [sendTxStartTime, setSendTxStartTime] = useState<number>(0)

  const submitTx = useCallback(() => {
    setSendTxStartTime(Date.now())

    subscribeSendTxState(
      transfer$({
        walletType,
        walletIndex,
        hdMode,
        recipient: form.getFieldValue('recipient'),
        asset,
        amount: amountToSend,
        memo: form.getFieldValue('memo')
      })
    )
  }, [subscribeSendTxState, transfer$, walletType, walletIndex, hdMode, form, asset, amountToSend])

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  const renderConfirmationModal = useMemo(() => {
    const onSuccessHandler = () => {
      setShowConfirmationModal(false)
      submitTx()
    }
    const onCloseHandler = () => {
      setShowConfirmationModal(false)
    }

    if (isKeystoreWallet(walletType)) {
      return (
        <WalletPasswordConfirmationModal
          onSuccess={onSuccessHandler}
          onClose={onCloseHandler}
          validatePassword$={validatePassword$}
        />
      )
    }
    if (isLedgerWallet(walletType)) {
      return (
        <LedgerConfirmationModal
          network={network}
          onSuccess={onSuccessHandler}
          onClose={onCloseHandler}
          visible={showConfirmationModal}
          chain={CosmosChain}
          description2={intl.formatMessage({ id: 'ledger.sign' })}
          addresses={O.none}
        />
      )
    }
    return null
  }, [intl, network, submitTx, showConfirmationModal, validatePassword$, walletType])

  const renderTxModal = useMemo(
    () =>
      Shared.renderTxModal({
        asset,
        amountToSend,
        network,
        sendTxState,
        resetSendTxState,
        sendTxStartTime,
        openExplorerTxUrl,
        getExplorerTxUrl,
        intl
      }),
    [
      asset,
      amountToSend,
      network,
      sendTxState,
      resetSendTxState,
      sendTxStartTime,
      openExplorerTxUrl,
      getExplorerTxUrl,
      intl
    ]
  )

  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        feeRD,
        RD.map((fee) => [{ asset: AssetRuneNative, amount: fee }])
      ),

    [feeRD]
  )

  const onChangeInput = useCallback(
    async (value: BigNumber) => {
      // we have to validate input before storing into the state
      amountValidator(undefined, value)
        .then(() => {
          setAmountToSend(assetToBase(assetAmount(value, COSMOS_DECIMAL)))
        })
        .catch(() => {}) // do nothing, antd form does the job for us to show an error message
    },
    [amountValidator]
  )

  const addMaxAmountHandler = useCallback(() => setAmountToSend(maxAmount), [maxAmount])

  const [recipientAddress, setRecipientAddress] = useState<Address>('')
  const handleOnKeyUp = useCallback(() => {
    setRecipientAddress(form.getFieldValue('recipient'))
  }, [form])

  const oMatchedWalletType: O.Option<WalletType> = useMemo(
    () => H.matchedWalletType(balances, recipientAddress),
    [balances, recipientAddress]
  )

  const renderWalletType = useMemo(() => H.renderedWalletType(oMatchedWalletType), [oMatchedWalletType])

  const disableSubmit = useMemo(() => isFeeError || RD.isPending(feeRD), [feeRD, isFeeError])

  return (
    <>
      <Row>
        <Styled.Col span={24}>
          <AccountSelector selectedWallet={balance} network={network} />
          <Styled.Form
            form={form}
            initialValues={{ amount: bn(0) }}
            onFinish={() => setShowConfirmationModal(true)}
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
                  decimal={COSMOS_DECIMAL}
                  onChange={onChangeInput}
                />
              </Styled.FormItem>
              <MaxBalanceButton
                className="mb-10px"
                color="neutral"
                balance={{ amount: maxAmount, asset: asset }}
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
            <FlatButton
              className="mt-40px min-w-[200px]"
              loading={isLoading}
              disabled={disableSubmit}
              type="submit"
              size="large">
              {intl.formatMessage({ id: 'wallet.action.send' })}
            </FlatButton>
          </Styled.Form>
        </Styled.Col>
      </Row>
      {showConfirmationModal && renderConfirmationModal}
      {renderTxModal}
    </>
  )
}

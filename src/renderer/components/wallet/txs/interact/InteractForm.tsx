import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getBondMemo, getLeaveMemo, getUnbondMemo } from '@thorchain/asgardex-util'
import {
  assetAmount,
  AssetRuneNative,
  assetToBase,
  BaseAmount,
  baseToAsset,
  formatAssetAmountCurrency,
  THORChain
} from '@xchainjs/xchain-util'
import { Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { isKeystoreWallet, isLedgerWallet } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../../const'
import { THORCHAIN_DECIMAL } from '../../../../helpers/assetHelper'
import { validateAddress } from '../../../../helpers/form/validation'
import { useSubscriptionState } from '../../../../hooks/useSubscriptionState'
import { FeeRD } from '../../../../services/chain/types'
import { AddressValidation, GetExplorerTxUrl, OpenExplorerTxUrl } from '../../../../services/clients'
import { INITIAL_INTERACT_STATE } from '../../../../services/thorchain/const'
import { InteractState, InteractStateHandler } from '../../../../services/thorchain/types'
import { ValidatePasswordHandler, WalletBalance } from '../../../../services/wallet/types'
import { LedgerConfirmationModal, WalletPasswordConfirmationModal } from '../../../modal/confirmation'
import { TxModal } from '../../../modal/tx'
import { SendAsset } from '../../../modal/tx/extra/SendAsset'
import { ViewTxButton } from '../../../uielements/button'
import { MaxBalanceButton } from '../../../uielements/button/MaxBalanceButton'
import { UIFeesRD } from '../../../uielements/fees'
import { Input, InputBigNumber } from '../../../uielements/input'
import { Label } from '../../../uielements/label'
import { validateTxAmountInput } from '../TxForm.util'
import * as H from './Interact.helpers'
import * as Styled from './Interact.styles'
import { InteractType } from './Interact.types'

type FormValues = { memo: string; thorAddress: string; amount: BigNumber }

type Props = {
  interactType: InteractType
  walletType: WalletType
  walletIndex: number
  balance: WalletBalance
  interact$: InteractStateHandler
  openExplorerTxUrl: OpenExplorerTxUrl
  getExplorerTxUrl: GetExplorerTxUrl
  fee: FeeRD
  reloadFeesHandler: FP.Lazy<void>
  addressValidation: AddressValidation
  validatePassword$: ValidatePasswordHandler
  network: Network
}
export const InteractForm: React.FC<Props> = (props) => {
  const {
    interactType,
    balance,
    walletType,
    walletIndex,
    interact$,
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

  const [_amountToSend, setAmountToSend] = useState<BaseAmount>(ZERO_BASE_AMOUNT)

  const amountToSend = useMemo(() => {
    switch (interactType) {
      case 'bond':
      case 'custom':
        return _amountToSend
      case 'leave':
      case 'unbond':
        return ZERO_BASE_AMOUNT
    }
  }, [_amountToSend, interactType])

  const {
    state: interactState,
    reset: resetInteractState,
    subscribe: subscribeInteractState
  } = useSubscriptionState<InteractState>(INITIAL_INTERACT_STATE)

  const isLoading = useMemo(() => RD.isPending(interactState.txRD), [interactState.txRD])

  const [form] = Form.useForm<FormValues>()

  const oFee: O.Option<BaseAmount> = useMemo(() => FP.pipe(feeRD, RD.toOption), [feeRD])

  const isFeeError = useMemo(
    () =>
      FP.pipe(
        oFee,
        O.fold(
          // Missing (or loading) fees does not mean we can't sent something. No error then.
          () => !O.isNone(oFee),
          (fee) => balance.amount.amount().isLessThan(fee.amount())
        )
      ),
    [balance, oFee]
  )

  const renderFeeError = useMemo(
    () => (
      <Label size="big" color="error">
        {intl.formatMessage(
          { id: 'wallet.errors.fee.notCovered' },
          {
            balance: formatAssetAmountCurrency({
              amount: baseToAsset(balance.amount),
              asset: AssetRuneNative,
              trimZeros: true
            })
          }
        )}
      </Label>
    ),
    [intl, balance.amount]
  )

  // max amount for RuneNative
  const maxAmount: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oFee,
        O.fold(
          // Set maxAmount to zero if we dont know anything about fees
          () => ZERO_BASE_AMOUNT,
          (fee) => balance.amount.minus(fee)
        )
      ),
    [oFee, balance.amount]
  )

  const amountValidator = useCallback(
    async (_: unknown, value: BigNumber) => {
      switch (interactType) {
        case 'bond':
          // similar to any other form for sending any amount
          return validateTxAmountInput({
            input: value,
            maxAmount: baseToAsset(maxAmount),
            errors: {
              msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
              msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
              msg3: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' })
            }
          })
        case 'unbond':
          return H.validateUnboundAmountInput({
            input: value,
            errors: {
              msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
              msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' })
            }
          })
        case 'custom':
          return H.validateCustomAmountInput({
            input: value,
            errors: {
              msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
              msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterOrEqualThan' }, { amount: '0' })
            }
          })
        case 'leave':
          return Promise.resolve(true)
      }
    },
    [interactType, intl, maxAmount]
  )

  const onChangeInput = useCallback(
    async (value: BigNumber) => {
      // we have to validate input before storing into the state
      amountValidator(undefined, value)
        .then(() => {
          if (interactType === 'bond' || interactType === 'custom') {
            setAmountToSend(assetToBase(assetAmount(value, THORCHAIN_DECIMAL)))
          }
        })
        .catch(() => {}) // do nothing, Ant' form does the job for us to show an error message
    },
    [amountValidator, interactType]
  )

  const addMaxAmountHandler = useCallback(() => setAmountToSend(maxAmount), [maxAmount])

  const addressValidator = useCallback(
    async (_: unknown, value: string) =>
      FP.pipe(
        value,
        validateAddress(
          addressValidation,
          intl.formatMessage({ id: 'wallet.validations.shouldNotBeEmpty' }),
          intl.formatMessage({ id: 'wallet.errors.address.invalid' })
        ),
        E.fold(
          (e) => Promise.reject(e),
          () => Promise.resolve()
        )
      ),
    [addressValidation, intl]
  )

  // Send tx start time
  const [sendTxStartTime, setSendTxStartTime] = useState<number>(0)

  const getMemo = useCallback(() => {
    const thorAddress = form.getFieldValue('thorAddress')
    switch (interactType) {
      case 'bond':
        return getBondMemo(thorAddress)
      case 'unbond':
        return getUnbondMemo(thorAddress, assetToBase(assetAmount(form.getFieldValue('amount'), THORCHAIN_DECIMAL)))
      case 'leave':
        return getLeaveMemo(thorAddress)
      case 'custom':
        return form.getFieldValue('memo')
    }
  }, [form, interactType])

  const submitTx = useCallback(() => {
    setSendTxStartTime(Date.now())

    subscribeInteractState(
      interact$({
        walletType,
        walletIndex,
        amount: amountToSend,
        memo: getMemo()
      })
    )
  }, [subscribeInteractState, interact$, walletType, walletIndex, amountToSend, getMemo])

  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  const reset = useCallback(() => {
    resetInteractState()
    setAmountToSend(ZERO_BASE_AMOUNT)
    form.setFieldsValue({
      thorAddress: '',
      memo: '',
      amount: ZERO_BN
    })
  }, [form, resetInteractState])

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
          chain={THORChain}
          description={intl.formatMessage({ id: 'wallet.ledger.confirm' })}
          addresses={O.none}
        />
      )
    }
    return <></>
  }, [walletType, submitTx, validatePassword$, network, showConfirmationModal, intl])

  const renderTxModal = useMemo(() => {
    const { txRD } = interactState

    // don't render TxModal in initial state
    if (RD.isInitial(txRD)) return <></>

    const oTxHash = RD.toOption(txRD)

    const txRDasBoolean = FP.pipe(
      txRD,
      RD.map((txHash) => !!txHash)
    )

    return (
      <TxModal
        title={intl.formatMessage({ id: 'common.tx.sending' })}
        onClose={reset}
        onFinish={reset}
        startTime={sendTxStartTime}
        txRD={txRDasBoolean}
        extraResult={
          <ViewTxButton
            txHash={oTxHash}
            onClick={openExplorerTxUrl}
            txUrl={FP.pipe(oTxHash, O.chain(getExplorerTxUrl))}
          />
        }
        timerValue={FP.pipe(
          txRD,
          RD.fold(
            () => 0,
            FP.flow(
              O.map(({ loaded }) => loaded),
              O.getOrElse(() => 0)
            ),
            () => 0,
            () => 100
          )
        )}
        extra={
          <SendAsset
            asset={{ asset, amount: amountToSend }}
            network={network}
            description={H.getInteractiveDescription({ state: interactState, intl })}
          />
        }
      />
    )
  }, [interactState, intl, reset, sendTxStartTime, openExplorerTxUrl, getExplorerTxUrl, asset, amountToSend, network])

  const submitLabel = useMemo(() => {
    switch (interactType) {
      case 'bond':
        return intl.formatMessage({ id: 'deposit.interact.actions.bond' })
      case 'unbond':
        return intl.formatMessage({ id: 'deposit.interact.actions.unbond' })
      case 'leave':
        return intl.formatMessage({ id: 'deposit.interact.actions.leave' })
      case 'custom':
        return intl.formatMessage({ id: 'wallet.action.send' })
    }
  }, [interactType, intl])

  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        feeRD,
        RD.map((fee) => [{ asset: AssetRuneNative, amount: fee }])
      ),

    [feeRD]
  )

  useEffect(() => {
    // Whenever `amountToSend` has been updated, we put it back into input field
    form.setFieldsValue({
      amount: baseToAsset(_amountToSend).amount()
    })
  }, [_amountToSend, form])

  return (
    <Styled.Form form={form} onFinish={() => setShowConfirmationModal(true)} initialValues={{ thorAddress: '' }}>
      <>
        {/* Memo input (CUSTOM only) */}
        {interactType === 'custom' && (
          <Styled.InputContainer>
            <Styled.InputLabel>{intl.formatMessage({ id: 'common.memo' })}</Styled.InputLabel>
            <Form.Item
              name="memo"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({ id: 'wallet.validations.shouldNotBeEmpty' })
                }
              ]}>
              <Input disabled={isLoading} size="large" />
            </Form.Item>
          </Styled.InputContainer>
        )}

        {/* THOR address input (BOND/UNBOND/LEAVE only) */}
        {(interactType === 'bond' || interactType === 'unbond' || interactType === 'leave') && (
          <Styled.InputContainer>
            <Styled.InputLabel>{intl.formatMessage({ id: 'common.thorAddress' })}</Styled.InputLabel>
            <Form.Item
              name="thorAddress"
              rules={[
                {
                  required: true,
                  validator: addressValidator
                }
              ]}>
              <Input disabled={isLoading} size="large" />
            </Form.Item>
          </Styled.InputContainer>
        )}

        {/* Amount input (BOND/UNBOND/CUSTOM only) */}
        {(interactType === 'bond' || interactType === 'unbond' || interactType === 'custom') && (
          <Styled.InputContainer>
            <Styled.InputLabel>{intl.formatMessage({ id: 'common.amount' })}</Styled.InputLabel>
            <Styled.FormItem
              name="amount"
              rules={[
                {
                  required: true,
                  validator: amountValidator
                }
              ]}>
              <InputBigNumber disabled={isLoading} size="large" decimal={THORCHAIN_DECIMAL} onChange={onChangeInput} />
            </Styled.FormItem>
            {/* max. amount button (BOND/CUSTOM only) */}
            {(interactType === 'bond' || interactType === 'custom') && (
              <MaxBalanceButton
                balance={{ amount: maxAmount, asset: asset }}
                onClick={addMaxAmountHandler}
                disabled={isLoading}
              />
            )}
            <Styled.Fees fees={uiFeesRD} reloadFees={reloadFeesHandler} disabled={isLoading} />
            {isFeeError && renderFeeError}
          </Styled.InputContainer>
        )}
      </>

      <Styled.SubmitButtonContainer>
        <Styled.SubmitButton
          loading={isLoading}
          disabled={isLoading || !!form.getFieldsError().filter(({ errors }) => errors.length).length}
          htmlType="submit">
          {submitLabel}
        </Styled.SubmitButton>
      </Styled.SubmitButtonContainer>
      {showConfirmationModal && renderConfirmationModal}
      {renderTxModal}
    </Styled.Form>
  )
}

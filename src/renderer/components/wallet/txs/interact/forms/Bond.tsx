import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getBondMemo } from '@thorchain/asgardex-util'
import { assetAmount, assetToBase, BaseAmount, baseToAsset, THORChain } from '@xchainjs/xchain-util'
import { Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as E from 'fp-ts/Either'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../../shared/api/types'
import { isKeystoreWallet, isLedgerWallet } from '../../../../../../shared/utils/guard'
import { WalletType } from '../../../../../../shared/wallet/types'
import { ZERO_BASE_AMOUNT } from '../../../../../const'
import { THORCHAIN_DECIMAL } from '../../../../../helpers/assetHelper'
import { validateAddress } from '../../../../../helpers/form/validation'
import { useSubscriptionState } from '../../../../../hooks/useSubscriptionState'
import { AddressValidation, GetExplorerTxUrl, OpenExplorerTxUrl } from '../../../../../services/clients'
import { INITIAL_INTERACT_STATE } from '../../../../../services/thorchain/const'
import { InteractState, InteractStateHandler } from '../../../../../services/thorchain/types'
import { ValidatePasswordHandler, WalletBalance } from '../../../../../services/wallet/types'
import { LedgerConfirmationModal, WalletPasswordConfirmationModal } from '../../../../modal/confirmation'
import { MaxBalanceButton } from '../../../../uielements/button/MaxBalanceButton'
import { Input, InputBigNumber } from '../../../../uielements/input'
import { validateTxAmountInput } from '../../TxForm.util'
import * as Shared from './Forms.shared'
import * as Styled from './Forms.styles'

type FormValues = { thorAddress: string; amount: BigNumber }

type Props = {
  walletType: WalletType
  walletIndex: number
  balance: WalletBalance
  interact$: InteractStateHandler
  openExplorerTxUrl: OpenExplorerTxUrl
  getExplorerTxUrl: GetExplorerTxUrl
  addressValidation: AddressValidation
  validatePassword$: ValidatePasswordHandler
  network: Network
}
export const Bond: React.FC<Props> = (props) => {
  const {
    balance,
    walletType,
    walletIndex,
    interact$,
    openExplorerTxUrl,
    getExplorerTxUrl,
    addressValidation,
    validatePassword$,
    network
  } = props
  const intl = useIntl()

  const { asset } = balance

  const [amountToSend, setAmountToSend] = useState<BaseAmount>(ZERO_BASE_AMOUNT)

  const {
    state: interactState,
    reset: resetInteractState,
    subscribe: subscribeInteractState
  } = useSubscriptionState<InteractState>(INITIAL_INTERACT_STATE)

  const isLoading = useMemo(() => RD.isPending(interactState.txRD), [interactState.txRD])

  const [form] = Form.useForm<FormValues>()

  const maxAmount: BaseAmount = useMemo(() => balance.amount, [balance.amount])

  const amountValidator = useCallback(
    async (_: unknown, value: BigNumber) => {
      // error messages
      const errors = {
        msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
        msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
        msg3: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' })
      }
      return validateTxAmountInput({ input: value, maxAmount: baseToAsset(maxAmount), errors })
    },
    [intl, maxAmount]
  )

  const onChangeInput = useCallback(
    async (value: BigNumber) => {
      // we have to validate input before storing into the state
      amountValidator(undefined, value)
        .then(() => {
          setAmountToSend(assetToBase(assetAmount(value, THORCHAIN_DECIMAL)))
        })
        .catch(() => {}) // do nothing, Ant' form does the job for us to show an error message
    },
    [amountValidator]
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

  const submitTx = useCallback(() => {
    setSendTxStartTime(Date.now())

    subscribeInteractState(
      interact$({
        walletType,
        walletIndex,
        amount: amountToSend,
        memo: getBondMemo(form.getFieldValue('thorAddress'))
      })
    )
  }, [subscribeInteractState, interact$, walletType, walletIndex, amountToSend, form])

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
          chain={THORChain}
          description={intl.formatMessage({ id: 'wallet.ledger.confirm' })}
        />
      )
    }
    return <></>
  }, [walletType, submitTx, validatePassword$, network, showConfirmationModal, intl])

  const renderTxModal = useMemo(
    () =>
      Shared.renderTxModal({
        asset,
        amountToSend,
        network,
        interactState,
        resetInteractState,
        sendTxStartTime,
        openExplorerTxUrl,
        getExplorerTxUrl,
        intl
      }),
    [
      asset,
      amountToSend,
      network,
      interactState,
      resetInteractState,
      sendTxStartTime,
      openExplorerTxUrl,
      getExplorerTxUrl,
      intl
    ]
  )

  useEffect(() => {
    // Whenever `amountToSend` has been updated, we put it back into input field
    form.setFieldsValue({
      amount: baseToAsset(amountToSend).amount()
    })
  }, [amountToSend, form])

  return (
    <Styled.Form form={form} onFinish={() => setShowConfirmationModal(true)} initialValues={{ thorAddress: '' }}>
      <div>
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

        <Styled.InputContainer>
          <Styled.InputLabel>{intl.formatMessage({ id: 'common.amount' })}</Styled.InputLabel>
          <Form.Item
            name="amount"
            rules={[
              {
                required: true,
                validator: amountValidator
              }
            ]}>
            <InputBigNumber disabled={isLoading} size="large" decimal={THORCHAIN_DECIMAL} onChange={onChangeInput} />
          </Form.Item>
          <MaxBalanceButton
            balance={{ amount: maxAmount, asset: asset }}
            onClick={addMaxAmountHandler}
            disabled={isLoading}
          />
        </Styled.InputContainer>
      </div>

      <Styled.SubmitButtonContainer>
        <Styled.SubmitButton
          loading={isLoading}
          disabled={isLoading || !!form.getFieldsError().filter(({ errors }) => errors.length).length}
          htmlType="submit">
          {intl.formatMessage({ id: 'wallet.action.send' })}
        </Styled.SubmitButton>
      </Styled.SubmitButtonContainer>
      {showConfirmationModal && renderConfirmationModal}
      {renderTxModal}
    </Styled.Form>
  )
}

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Address } from '@xchainjs/xchain-client'
import { FeeParams, TERRA_DECIMAL } from '@xchainjs/xchain-terra'
import {
  formatAssetAmountCurrency,
  assetAmount,
  bn,
  assetToBase,
  BaseAmount,
  baseToAsset,
  assetFromString,
  Asset,
  assetToString,
  baseAmount,
  TerraChain,
  eqAsset
} from '@xchainjs/xchain-util'
import { Row, Form, Dropdown, Menu } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { isKeystoreWallet, isLedgerWallet } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import { ZERO_BASE_AMOUNT } from '../../../../const'
import { isTerraChain } from '../../../../helpers/chainHelper'
import { getWalletBalanceByAssetAndWalletType } from '../../../../helpers/walletHelper'
import { useSubscriptionState } from '../../../../hooks/useSubscriptionState'
import { INITIAL_SEND_STATE } from '../../../../services/chain/const'
import { FeeRD, SendTxState, SendTxStateHandler } from '../../../../services/chain/types'
import { AddressValidation, GetExplorerTxUrl, OpenExplorerTxUrl, WalletBalances } from '../../../../services/clients'
import { ValidatePasswordHandler } from '../../../../services/wallet/types'
import { WalletBalance } from '../../../../services/wallet/types'
import { DownIcon } from '../../../icons'
import { LedgerConfirmationModal, WalletPasswordConfirmationModal } from '../../../modal/confirmation'
import { MaxBalanceButton } from '../../../uielements/button/MaxBalanceButton'
import { UIFeesRD } from '../../../uielements/fees'
import { Input, InputBigNumber } from '../../../uielements/input'
import { AccountSelector } from '../../account'
import * as H from '../TxForm.helpers'
import * as Styled from '../TxForm.styles'
import { validateTxAmountInput } from '../TxForm.util'
import * as Shared from './Send.shared'
import * as CStyled from './SendFormTERRA.styles'

export type FormValues = {
  recipient: string
  amount: BigNumber
  memo?: string
}

export type Props = {
  walletType: WalletType
  walletIndex: number
  walletAddress: Address
  balances: WalletBalances
  balance: WalletBalance
  transfer$: SendTxStateHandler
  openExplorerTxUrl: OpenExplorerTxUrl
  getExplorerTxUrl: GetExplorerTxUrl
  addressValidation: AddressValidation
  fee: FeeRD
  reloadFeesHandler: (params: O.Option<FeeParams>) => void
  validatePassword$: ValidatePasswordHandler
  network: Network
}

export const SendFormTERRA: React.FC<Props> = (props): JSX.Element => {
  const {
    walletType,
    walletIndex,
    walletAddress,
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
  const [feeAsset, setFeeAsset] = useState<Asset>(asset)

  const [amountToSend, setAmountToSend] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [sendAddress, setSendAddress] = useState<O.Option<Address>>(O.none)

  const {
    state: sendTxState,
    reset: resetSendTxState,
    subscribe: subscribeSendTxState
  } = useSubscriptionState<SendTxState>(INITIAL_SEND_STATE)

  const isLoading = useMemo(() => RD.isPending(sendTxState.status), [sendTxState.status])

  const [form] = Form.useForm<FormValues>()

  const oFee: O.Option<BaseAmount> = useMemo(() => FP.pipe(feeRD, RD.toOption), [feeRD])

  const feeBalance: BaseAmount = useMemo(
    () =>
      FP.pipe(
        NEA.fromArray(balances),
        O.chain((walletBalances) =>
          getWalletBalanceByAssetAndWalletType({ oWalletBalances: O.some(walletBalances), asset: feeAsset, walletType })
        ),
        O.map(({ amount }) => amount),
        O.getOrElse(() => baseAmount(0, TERRA_DECIMAL))
      ),
    [balances, feeAsset, walletType]
  )

  const isFeeError = useMemo(() => {
    return FP.pipe(
      feeRD,
      RD.fold(
        () => false,
        () => false,
        (_) => true,
        (fee) => feeBalance.lt(fee)
      )
    )
  }, [feeRD, feeBalance])

  const renderFeeError = useMemo(() => {
    if (!isFeeError || RD.isFailure(feeRD) /* feeRD error is rendered in UIFee */) return <></>

    const msg = intl.formatMessage(
      { id: 'wallet.errors.fee.notCovered' },
      {
        balance: formatAssetAmountCurrency({ amount: baseToAsset(feeBalance), asset, trimZeros: true })
      }
    )

    return (
      <Styled.Label size="big" color="error">
        {msg}
      </Styled.Label>
    )
  }, [asset, feeBalance, feeRD, intl, isFeeError])

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

  // max amount
  const maxAmount: BaseAmount = useMemo(() => {
    if (eqAsset(feeAsset, asset)) {
      const max = FP.pipe(
        oFee,
        O.fold(
          () => balance.amount,
          (fee) => balance.amount.minus(fee)
        )
      )
      const zero = baseAmount(0, TERRA_DECIMAL)

      return max.gt(zero) ? max : zero
    }

    return balance.amount
  }, [asset, balance.amount, feeAsset, oFee])

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
        msg3: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' })
      }
      return validateTxAmountInput({ input: value, maxAmount: baseToAsset(maxAmount), errors })
    },
    [intl, maxAmount]
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

  const memoValidator = useCallback(
    async (_: unknown, value: string) => {
      const max = 256
      if (!!value && value.length > max) {
        return Promise.reject(intl.formatMessage({ id: 'wallet.errors.memo.max' }, { max: 256 }))
      }
    },
    [intl]
  )

  // Send tx start time
  const [sendTxStartTime, setSendTxStartTime] = useState<number>(0)

  const submitTx = useCallback(() => {
    setSendTxStartTime(Date.now())

    subscribeSendTxState(
      transfer$({
        walletType,
        walletIndex,
        recipient: form.getFieldValue('recipient'),
        asset,
        amount: amountToSend,
        memo: form.getFieldValue('memo')
      })
    )
  }, [subscribeSendTxState, transfer$, walletType, walletIndex, form, asset, amountToSend])

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
          chain={TerraChain}
          description={intl.formatMessage({ id: 'wallet.ledger.confirm' })}
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

  const onChangeInput = useCallback(
    async (value: BigNumber) => {
      // we have to validate input before storing into the state
      amountValidator(undefined, value)
        .then(() => {
          setAmountToSend(assetToBase(assetAmount(value, TERRA_DECIMAL)))
        })
        .catch(() => {}) // do nothing, Ant' form does the job for us to show an error message
    },
    [amountValidator]
  )

  const [recipientAddress, setRecipientAddress] = useState<Address>('')
  const handleOnKeyUp = useCallback(() => {
    setRecipientAddress(form.getFieldValue('recipient'))
  }, [form])

  const oMatchedWalletType: O.Option<WalletType> = useMemo(
    () => H.matchedWalletType(balances, recipientAddress),
    [balances, recipientAddress]
  )

  const reloadFees = useCallback(
    (overrideFeeAsset?: Asset) => {
      // Check validation errors
      // Note: Never use a memorized `H.hasFormErrors` here - it will re-load fees with errors otherwise
      // if (form.getFieldsError().filter(({ errors }) => errors.length).length) return {}
      if (H.hasFormErrors(form)) return {}
      // If not amount is set, use `1` BaseAmount (needed to calcu)
      const amount = FP.pipe(
        amountToSend,
        O.fromPredicate((value: BaseAmount) => value.gt(ZERO_BASE_AMOUNT)),
        O.getOrElse(() => baseAmount(1, TERRA_DECIMAL))
      )

      const recipient = FP.pipe(
        sendAddress,
        O.getOrElse(() => walletAddress)
      )

      reloadFeesHandler(
        O.some({
          asset,
          feeAsset: overrideFeeAsset || feeAsset,
          amount,
          recipient,
          sender: walletAddress,
          memo: form.getFieldValue('memo')
        })
      )
    },
    [amountToSend, asset, feeAsset, form, reloadFeesHandler, sendAddress, walletAddress]
  )

  const addMaxAmountHandler = useCallback(() => {
    setAmountToSend(maxAmount)
    reloadFees()
  }, [maxAmount, reloadFees])

  const changeFeeHandler: MenuProps['onClick'] = useCallback(
    ({ key: assetAsString }) => {
      FP.pipe(
        assetAsString,
        assetFromString,
        O.fromNullable,
        O.map((asset) => {
          setFeeAsset(asset)
          reloadFees(asset)
          return true
        })
      )
    },
    [reloadFees]
  )

  const feeAssetMenu = useMemo(
    () => (
      <Menu onClick={changeFeeHandler}>
        {FP.pipe(
          balances,
          A.filter(({ asset }) => isTerraChain(asset.chain)),
          A.map(({ asset }) => (
            <CStyled.MenuItem key={assetToString(asset)}>
              <CStyled.MenuItemText>{asset.ticker}</CStyled.MenuItemText>
            </CStyled.MenuItem>
          ))
        )}
      </Menu>
    ),
    [balances, changeFeeHandler]
  )

  const renderFeeAssetSelector = useMemo(
    () => (
      <Row style={{ alignItems: 'center' }}>
        <Styled.CustomLabel size="big" style={{ width: 'auto' }}>
          Fee asset
        </Styled.CustomLabel>
        <Dropdown overlay={feeAssetMenu} trigger={['click']} placement="bottomCenter">
          <CStyled.DropdownContentWrapper>
            <Row style={{ alignItems: 'center' }}>
              <CStyled.MenuItemText>{feeAsset.ticker}</CStyled.MenuItemText>
              <DownIcon />
            </Row>
          </CStyled.DropdownContentWrapper>
        </Dropdown>
      </Row>
    ),
    [feeAsset.ticker, feeAssetMenu]
  )

  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        feeRD,
        RD.map((fee) => [{ asset: feeAsset, amount: fee }])
      ),

    [feeAsset, feeRD]
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
                <Input
                  color="primary"
                  size="large"
                  disabled={isLoading}
                  onBlur={() => reloadFees(feeAsset)}
                  onChange={onChangeAddress}
                  onKeyUp={handleOnKeyUp}
                />
              </Form.Item>
              <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
              <Styled.FormItem rules={[{ required: true, validator: amountValidator }]} name="amount">
                <InputBigNumber
                  min={0}
                  size="large"
                  disabled={isLoading}
                  decimal={TERRA_DECIMAL}
                  onBlur={() => reloadFees(feeAsset)}
                  onChange={onChangeInput}
                />
              </Styled.FormItem>
              <MaxBalanceButton
                balance={{ amount: maxAmount, asset: asset }}
                onClick={addMaxAmountHandler}
                disabled={isLoading}
              />
              {renderFeeAssetSelector}
              <Styled.Fees fees={uiFeesRD} reloadFees={reloadFees} disabled={isLoading} />
              {renderFeeError}
              <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.memo' })}</Styled.CustomLabel>
              <Form.Item rules={[{ required: true, validator: memoValidator }]} name="memo">
                <Input size="large" disabled={isLoading} onBlur={() => reloadFees(feeAsset)} />
              </Form.Item>
            </Styled.SubForm>
            <Styled.SubmitContainer>
              <Styled.Button loading={isLoading} disabled={disableSubmit} htmlType="submit">
                {intl.formatMessage({ id: 'wallet.action.send' })}
              </Styled.Button>
            </Styled.SubmitContainer>
          </Styled.Form>
        </Styled.Col>
      </Row>
      {showConfirmationModal && renderConfirmationModal}
      {renderTxModal}
    </>
  )
}

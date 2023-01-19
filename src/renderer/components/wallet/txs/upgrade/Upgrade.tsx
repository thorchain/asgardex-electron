import React, { useMemo, useCallback, useState, useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getSwitchMemo } from '@thorchain/asgardex-util'
import { TxParams } from '@xchainjs/xchain-client'
import {
  Address,
  assetAmount,
  assetToBase,
  BaseAmount,
  baseToAsset,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
import { Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as S from 'fp-ts/lib/string'
import { useIntl } from 'react-intl'

import { chainToString } from '../../../../../shared/utils/chain'
import { isKeystoreWallet, isLedgerWallet, isWalletType } from '../../../../../shared/utils/guard'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../../const'
import { convertBaseAmountDecimal } from '../../../../helpers/assetHelper'
import { getChainAsset, isEthChain } from '../../../../helpers/chainHelper'
import { eqAsset, eqString } from '../../../../helpers/fp/eq'
import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { emptyString } from '../../../../helpers/stringHelper'
import { getWalletAssetAmountFromBalances } from '../../../../helpers/walletHelper'
import { useSubscriptionState } from '../../../../hooks/useSubscriptionState'
import { INITIAL_UPGRADE_RUNE_STATE } from '../../../../services/chain/const'
import { UpgradeRuneTxState } from '../../../../services/chain/types'
import { FeeRD } from '../../../../services/chain/types'
import { WalletBalances } from '../../../../services/clients'
import { CommonUpgradeProps } from '../../../../views/wallet/upgrade/types'
import { LedgerConfirmationModal, WalletPasswordConfirmationModal } from '../../../modal/confirmation'
import { TxModal } from '../../../modal/tx'
import { SendAsset } from '../../../modal/tx/extra/SendAsset'
import { FlatButton } from '../../../uielements/button'
import { MaxBalanceButton } from '../../../uielements/button/MaxBalanceButton'
import { ViewTxButton } from '../../../uielements/button/ViewTxButton'
import { UIFeesRD } from '../../../uielements/fees'
import { Input } from '../../../uielements/input'
import { InputBigNumber } from '../../../uielements/input/InputBigNumber'
import { AccountSelector } from '../../account'
import { SelectableWalletType, WalletTypesSelectorItems } from '../../walletType/WalletTypeSelector.types'
import * as H from '../TxForm.helpers'
import * as Styled from '../TxForm.styles'
import { validateTxAmountInput } from '../TxForm.util'
import * as CH from './Upgrade.helpers'
import * as CStyled from './Upgrade.styles'

export type Props = CommonUpgradeProps & {
  fee: FeeRD
  reloadFeeHandler: (params: TxParams) => void
}

type FormValues = {
  amount: BigNumber
  address: Address
}

export const Upgrade: React.FC<Props> = (props): JSX.Element => {
  const {
    runeNativeAddress: initialRuneNativeAddress,
    runeNativeLedgerAddress: oRuneNativeLedgerAddress,
    targetPoolAddress,
    validatePassword$,
    fee: feeRD,
    upgrade$,
    balances: oBalances,
    reloadBalancesHandler,
    openExplorerTxUrl,
    getExplorerTxUrl,
    reloadFeeHandler,
    addressValidation,
    network,
    assetData: { asset, walletAddress, walletType, walletIndex, hdMode, decimal: assetDecimal }
  } = props

  const intl = useIntl()

  const [form] = Form.useForm<FormValues>()

  const { chain } = asset

  const [amountToUpgrade, setAmountToUpgrade] = useState<BaseAmount>(ZERO_BASE_AMOUNT)

  const [targetAddress, _setTargetAddress] = useState<O.Option<Address>>(O.some(initialRuneNativeAddress))

  const setTargetAddress = useCallback(
    (oAddress: O.Option<Address>) => {
      const value = FP.pipe(
        oAddress,
        O.fold(() => emptyString, FP.identity)
      )

      form.setFieldsValue({ address: value })

      _setTargetAddress(oAddress)
    },
    [form]
  )
  const hasRuneNativeLedgerAddress = useMemo(() => O.isSome(oRuneNativeLedgerAddress), [oRuneNativeLedgerAddress])

  const targetWalletTypes: WalletTypesSelectorItems = useMemo(() => {
    const labels: Record<SelectableWalletType, string> = {
      keystore: intl.formatMessage({ id: 'common.keystore' }),
      ledger: intl.formatMessage({ id: 'common.ledger' }),
      custom: intl.formatMessage({ id: 'common.custom' })
    }
    return FP.pipe(
      // String of wallet types depending on conditions
      `keystore,${hasRuneNativeLedgerAddress ? 'ledger' : null}, custom`,
      S.split(','),
      NEA.fromReadonlyNonEmptyArray,
      // Filter out `null` values to use valid `WalletType` only
      A.filter(isWalletType),
      // Transform `WalletType` -> `SelectableWalletType`
      A.concatW<SelectableWalletType>(['custom']),
      A.map((t) => ({ type: t, label: labels[t] }))
    )
  }, [hasRuneNativeLedgerAddress, intl])

  // State for visibility of Modal to confirm upgrade
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)

  const {
    state: upgradeTxState,
    reset: resetUpgradeTxState,
    subscribe: subscribeUpgradeTxState
  } = useSubscriptionState<UpgradeRuneTxState>(INITIAL_UPGRADE_RUNE_STATE)

  const getRuneBalance = useMemo(
    () =>
      getWalletAssetAmountFromBalances(
        (balance) => eqString.equals(balance.walletAddress, walletAddress) && eqAsset.equals(balance.asset, asset)
      ),
    [asset, walletAddress]
  )

  const chainBaseAsset = useMemo(() => getChainAsset(chain), [chain])

  const getBaseAssetBalance = useMemo(
    () =>
      getWalletAssetAmountFromBalances(
        (balance) =>
          eqString.equals(balance.walletAddress, walletAddress) && eqAsset.equals(balance.asset, chainBaseAsset)
      ),
    [chainBaseAsset, walletAddress]
  )

  const oNonNativeRuneAmount: O.Option<BaseAmount> = useMemo(
    () => FP.pipe(oBalances, O.chain(FP.flow(getRuneBalance, O.map(assetToBase)))),
    [oBalances, getRuneBalance]
  )

  const oBaseAssetAmount: O.Option<BaseAmount> = useMemo(
    () => FP.pipe(oBalances, O.chain(FP.flow(getBaseAssetBalance, O.map(assetToBase)))),
    [oBalances, getBaseAssetBalance]
  )

  const maxAmount: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oNonNativeRuneAmount,
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oNonNativeRuneAmount]
  )

  useEffect(() => {
    // Whenever `amountToUpgrade` has been updated, we put it back into input field
    form.setFieldsValue({
      amount: baseToAsset(amountToUpgrade).amount()
    })
  }, [amountToUpgrade, form])

  const amountValidator = useCallback(
    async (_: unknown, value: BigNumber) => {
      return validateTxAmountInput({
        input: value,
        maxAmount: baseToAsset(maxAmount),
        errors: {
          msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
          msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
          msg3: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' })
        }
      })
    },
    [intl, maxAmount]
  )

  const onChangeInput = useCallback(
    async (value: BigNumber) => {
      // we have to validate input before storing into the state
      amountValidator(undefined, value)
        .then(() => {
          setAmountToUpgrade(convertBaseAmountDecimal(assetToBase(assetAmount(value)), assetDecimal))
        })
        .catch(() => {}) // do nothing, Ant' form does the job for us to show an error message
    },
    [amountValidator, assetDecimal]
  )

  // Send tx start time
  const [sendTxStartTime, setSendTxStartTime] = useState<number>(0)

  const submitTx = useCallback(() => {
    setSendTxStartTime(Date.now())

    subscribeUpgradeTxState(
      upgrade$({
        poolAddress: targetPoolAddress,
        amount: amountToUpgrade,
        asset,
        memo: getSwitchMemo(form.getFieldValue('address')),
        network,
        walletAddress,
        walletIndex,
        walletType,
        hdMode
      })
    )
  }, [
    subscribeUpgradeTxState,
    upgrade$,
    targetPoolAddress,
    amountToUpgrade,
    asset,
    form,
    network,
    walletAddress,
    walletIndex,
    walletType,
    hdMode
  ])

  const oFee: O.Option<BaseAmount> = useMemo(() => FP.pipe(feeRD, RD.toOption), [feeRD])

  const isFeeError = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oFee, oBaseAssetAmount),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFee),
        ([fee, baseAssetAmount]) => baseAssetAmount.amount().isLessThan(fee.amount())
      )
    )
  }, [oBaseAssetAmount, oFee])

  const renderFeeError = useMemo(() => {
    if (!isFeeError) return <></>

    return FP.pipe(
      sequenceTOption(oFee, oBaseAssetAmount),
      O.map(([fee, baseAssetAmount]) => {
        const msg = intl.formatMessage(
          { id: 'wallet.upgrade.feeError' },
          {
            fee: formatAssetAmountCurrency({
              amount: baseToAsset(fee),
              asset: chainBaseAsset,
              trimZeros: true
            }),
            balance: formatAssetAmountCurrency({
              amount: baseToAsset(baseAssetAmount),
              asset: chainBaseAsset,
              trimZeros: true
            })
          }
        )
        // `key`  has to be set to avoid "Missing "key" prop for element in iterator"
        return (
          <Styled.Label key="upgrade-fee-error" size="big" color="error">
            {msg}
          </Styled.Label>
        )
      }),
      O.getOrElse(() => <></>)
    )
  }, [isFeeError, oFee, oBaseAssetAmount, intl, chainBaseAsset])

  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        feeRD,
        RD.map((fee) => [{ asset: chainBaseAsset, amount: fee }])
      ),

    [feeRD, chainBaseAsset]
  )

  const txStatusMsg = useMemo(() => {
    const stepDescriptions = [
      intl.formatMessage({ id: 'common.tx.healthCheck' }),
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetTicker: asset.ticker }),
      intl.formatMessage({ id: 'common.tx.checkResult' })
    ]
    const { steps, status } = upgradeTxState

    return FP.pipe(
      status,
      RD.fold(
        () => emptyString,
        () =>
          `${stepDescriptions[steps.current - 1]} (${intl.formatMessage(
            { id: 'common.step' },
            { current: steps.current, total: steps.total }
          )})`,
        () => emptyString,
        () => emptyString
      )
    )
  }, [intl, asset.ticker, upgradeTxState])

  const addMaxAmountHandler = useCallback(() => setAmountToUpgrade(maxAmount), [maxAmount])

  const isLoading = useMemo(() => RD.isPending(upgradeTxState.status), [upgradeTxState.status])

  const isDisabled: boolean = useMemo(
    () =>
      isFeeError ||
      FP.pipe(
        oNonNativeRuneAmount,
        O.map((amount) => amount.amount().isLessThanOrEqualTo(0) || isLoading),
        O.getOrElse<boolean>(() => true)
      ),
    [isFeeError, oNonNativeRuneAmount, isLoading]
  )

  const reloadFees = useCallback(() => {
    reloadFeeHandler({ asset, amount: amountToUpgrade, recipient: targetPoolAddress.address })
  }, [targetPoolAddress, reloadFeeHandler, asset, amountToUpgrade])

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

  const onChangeTargetAddress = useCallback(() => {
    setTargetAddress(O.some(form.getFieldValue('address')))
  }, [form, setTargetAddress])

  const balances = useMemo(
    () =>
      FP.pipe(
        oBalances,
        O.getOrElse<WalletBalances>(() => [])
      ),
    [oBalances]
  )

  const selectedWalletType = useMemo(
    () =>
      FP.pipe(
        targetAddress,
        O.chain((address) => H.matchedWalletType(balances, address)),
        O.getOrElse<SelectableWalletType>(() => 'custom')
      ),
    [balances, targetAddress]
  )

  const selectedWalletTypeChanged = useCallback(
    (type: SelectableWalletType) => {
      let address: O.Option<Address> = O.none
      if (type === 'keystore') {
        address = O.some(initialRuneNativeAddress)
      }
      if (type === 'ledger') {
        address = oRuneNativeLedgerAddress
      }
      setTargetAddress(address)
    },
    [initialRuneNativeAddress, oRuneNativeLedgerAddress, setTargetAddress]
  )

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

    const chainAsString = chainToString(chain)
    const txtNeedsConnected = intl.formatMessage(
      {
        id: 'ledger.needsconnected'
      },
      { chain: chainAsString }
    )

    const description1 =
      // extra info for ETH.RUNE only
      isEthChain(chain)
        ? `${txtNeedsConnected} ${intl.formatMessage(
            {
              id: 'ledger.blindsign'
            },
            { chain: chainAsString }
          )}`
        : txtNeedsConnected

    const description2 = intl.formatMessage({ id: 'ledger.sign' })

    if (isLedgerWallet(walletType)) {
      return (
        <LedgerConfirmationModal
          network={network}
          onSuccess={onSuccessHandler}
          onClose={onCloseHandler}
          visible={showConfirmationModal}
          chain={chain}
          description1={description1}
          description2={description2}
          addresses={O.none}
        />
      )
    }
    return null
  }, [chain, intl, network, showConfirmationModal, submitTx, validatePassword$, walletType])

  const renderTxModal = useMemo(() => {
    const { status } = upgradeTxState

    // don't render TxModal in initial state
    if (RD.isInitial(status)) return <></>

    const oTxHash = RD.toOption(status)

    const txRDasBoolean = FP.pipe(
      status,
      RD.map((txHash) => !!txHash)
    )

    const onCloseHandler = () => {
      resetUpgradeTxState()
      setAmountToUpgrade(ZERO_BASE_AMOUNT)
    }

    const onFinishHandler = () => {
      reloadBalancesHandler()
      resetUpgradeTxState()
      setAmountToUpgrade(ZERO_BASE_AMOUNT)
    }

    return (
      <TxModal
        title={intl.formatMessage({ id: 'common.tx.sending' })}
        onClose={onCloseHandler}
        onFinish={onFinishHandler}
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
          status,
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
            asset={{ asset, amount: amountToUpgrade }}
            network={network}
            description={CH.getUpgradeDescription({ state: upgradeTxState, intl })}
          />
        }
      />
    )
  }, [
    upgradeTxState,
    intl,
    sendTxStartTime,
    openExplorerTxUrl,
    getExplorerTxUrl,
    asset,
    amountToUpgrade,
    network,
    resetUpgradeTxState,
    reloadBalancesHandler
  ])

  return (
    <>
      <CStyled.FormWrapper>
        <CStyled.FormContainer>
          <AccountSelector
            selectedWallet={{
              walletType,
              amount: assetToBase(assetAmount(0)),
              asset,
              walletAddress: '',
              walletIndex,
              hdMode
            }}
            walletBalances={[]}
            network={network}
          />
          <Styled.Form
            form={form}
            initialValues={{ amount: ZERO_BN, address: initialRuneNativeAddress }}
            onFinish={() => setShowConfirmationModal(true)}
            labelCol={{ span: 24 }}>
            <Styled.SubForm>
              <Styled.CustomLabel size="big">{intl.formatMessage({ id: 'common.amount' })}</Styled.CustomLabel>
              <Styled.FormItem
                rules={[
                  {
                    required: true,
                    validator: amountValidator
                  }
                ]}
                name="amount"
                validateTrigger={['onSubmit', 'onChange', 'onBlur']}>
                <InputBigNumber size="large" disabled={isLoading} decimal={8} onChange={onChangeInput} />
              </Styled.FormItem>
              <MaxBalanceButton
                className="mb-10px"
                color="neutral"
                balance={{ amount: maxAmount, asset }}
                onClick={addMaxAmountHandler}
                disabled={isLoading}
              />

              <Styled.CustomLabel size="big" style={{ marginTop: '20px' }}>
                {intl.formatMessage({ id: 'common.address' })}
                <CStyled.WalletTypeSelector
                  selectedWalletType={selectedWalletType}
                  walletTypes={targetWalletTypes}
                  onChange={selectedWalletTypeChanged}
                />
              </Styled.CustomLabel>
              <Styled.FormItem rules={[{ required: true, validator: addressValidator }]} name="address">
                <Input color="primary" size="large" disabled={isLoading} onKeyUp={onChangeTargetAddress} />
              </Styled.FormItem>

              <CStyled.Fees fees={uiFeesRD} reloadFees={reloadFees} disabled={isLoading} />
              {renderFeeError}
            </Styled.SubForm>
            <Styled.SubmitContainer>
              <Styled.SubmitStatus>{txStatusMsg}</Styled.SubmitStatus>
              <FlatButton
                className="min-w-[200px]"
                loading={isLoading}
                disabled={isDisabled}
                type="submit"
                size="large">
                {intl.formatMessage({ id: 'wallet.action.upgrade' })}
              </FlatButton>
            </Styled.SubmitContainer>
          </Styled.Form>
        </CStyled.FormContainer>
      </CStyled.FormWrapper>
      {showConfirmationModal && renderConfirmationModal}
      {renderTxModal}
    </>
  )
}

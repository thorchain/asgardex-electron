import React, { useMemo, useCallback, useState, useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getSwitchMemo } from '@thorchain/asgardex-util'
import { Address, TxParams } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, BaseAmount, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as A from 'fp-ts/lib/Array'
import * as FP from 'fp-ts/lib/function'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import * as S from 'fp-ts/lib/string'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
import { isLedgerWallet, isWalletType } from '../../../../../shared/utils/guard'
import { WalletType } from '../../../../../shared/wallet/types'
import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../../const'
import { convertBaseAmountDecimal } from '../../../../helpers/assetHelper'
import { getChainAsset } from '../../../../helpers/chainHelper'
import { eqAsset, eqString } from '../../../../helpers/fp/eq'
import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { emptyString } from '../../../../helpers/stringHelper'
import { getWalletAssetAmountFromBalances } from '../../../../helpers/walletHelper'
import { useSubscriptionState } from '../../../../hooks/useSubscriptionState'
import { INITIAL_UPGRADE_RUNE_STATE } from '../../../../services/chain/const'
import { UpgradeRuneParams, UpgradeRuneTxState, UpgradeRuneTxState$ } from '../../../../services/chain/types'
import { FeeRD } from '../../../../services/chain/types'
import { AddressValidation, GetExplorerTxUrl, OpenExplorerTxUrl, WalletBalances } from '../../../../services/clients'
import { PoolAddressRD } from '../../../../services/midgard/types'
import { ValidatePasswordHandler } from '../../../../services/wallet/types'
import { AssetWithDecimal } from '../../../../types/asgardex'
import { WalletPasswordConfirmationModal } from '../../../modal/confirmation'
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
import * as CStyled from './Upgrade.styles'

export type Props = {
  runeAsset: AssetWithDecimal
  walletAddress: string
  walletType: WalletType
  walletIndex: number
  runeNativeAddress: Address
  runeNativeLedgerAddress: O.Option<Address>
  targetPoolAddressRD: PoolAddressRD
  validatePassword$: ValidatePasswordHandler
  fee: FeeRD
  upgrade$: (_: UpgradeRuneParams) => UpgradeRuneTxState$
  balances: O.Option<WalletBalances>
  reloadFeeHandler: (params: TxParams) => void
  addressValidation: AddressValidation
  successActionHandler: OpenExplorerTxUrl
  getExplorerTxUrl: GetExplorerTxUrl
  reloadBalancesHandler: FP.Lazy<void>
  network: Network
  reloadOnError: FP.Lazy<void>
}

type FormValues = {
  amount: BigNumber
  address: Address
}

export const Upgrade: React.FC<Props> = (props): JSX.Element => {
  const {
    runeAsset,
    runeNativeAddress: initialRuneNativeAddress,
    runeNativeLedgerAddress: oRuneNativeLedgerAddress,
    targetPoolAddressRD,
    validatePassword$,
    fee: feeRD,
    upgrade$,
    balances: oBalances,
    successActionHandler,
    getExplorerTxUrl,
    reloadFeeHandler,
    addressValidation,
    reloadBalancesHandler,
    network,
    walletAddress,
    walletType,
    walletIndex,
    reloadOnError
  } = props

  const intl = useIntl()

  const [form] = Form.useForm<FormValues>()

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
      ledger: 'Ledger',
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
  const [showConfirmUpgradeModal, setShowConfirmUpgradeModal] = useState(false)

  const {
    state: upgradeTxState,
    reset: resetUpgradeTxState,
    subscribe: subscribeUpgradeTxState
  } = useSubscriptionState<UpgradeRuneTxState>(INITIAL_UPGRADE_RUNE_STATE)

  const onFinishHandler = useCallback(() => {
    reloadBalancesHandler()
    resetUpgradeTxState()
    setAmountToUpgrade(ZERO_BASE_AMOUNT)
  }, [reloadBalancesHandler, resetUpgradeTxState])

  const onErrorHandler = useCallback(() => {
    resetUpgradeTxState()
    setAmountToUpgrade(ZERO_BASE_AMOUNT)
    /**
     * As `Upgrade` component depends on parent's Component state we also have to trigger reload of parent component's state too
     *
     * I.E. Loading of targetPoolAddressRD was failed:
     * Upgrade component renders Error view AND HAS TO:
     *    1. reset its' own state
     *    2. trigger higher-level data update
     */
    reloadOnError()
  }, [resetUpgradeTxState, reloadOnError])

  const getRuneBalance = useMemo(
    () =>
      getWalletAssetAmountFromBalances(
        (balance) =>
          eqString.equals(balance.walletAddress, walletAddress) && eqAsset.equals(balance.asset, runeAsset.asset)
      ),
    [runeAsset, walletAddress]
  )

  const chainBaseAsset = useMemo(() => getChainAsset(runeAsset.asset.chain), [runeAsset])

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
          setAmountToUpgrade(convertBaseAmountDecimal(assetToBase(assetAmount(value)), runeAsset.decimal))
        })
        .catch(() => {}) // do nothing, Ant' form does the job for us to show an error message
    },
    [amountValidator, runeAsset]
  )

  const upgrade = useCallback(
    () =>
      FP.pipe(
        targetPoolAddressRD,
        RD.toOption,
        O.map((poolAddress) => {
          subscribeUpgradeTxState(
            upgrade$({
              poolAddress,
              amount: amountToUpgrade,
              asset: runeAsset.asset,
              memo: getSwitchMemo(form.getFieldValue('address')),
              network,
              walletAddress,
              walletIndex,
              walletType
            })
          )
          return true
        })
      ),

    [
      targetPoolAddressRD,
      subscribeUpgradeTxState,
      upgrade$,
      amountToUpgrade,
      runeAsset.asset,
      form,
      network,
      walletAddress,
      walletIndex,
      walletType
    ]
  )

  const onSubmit = useCallback(() => {
    if (isLedgerWallet(walletType)) {
      upgrade()
    } else {
      setShowConfirmUpgradeModal(true)
    }
  }, [upgrade, walletType])

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
      intl.formatMessage({ id: 'common.tx.sendingAsset' }, { assetTicker: runeAsset.asset.ticker }),
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
  }, [intl, runeAsset.asset.ticker, upgradeTxState])

  const renderErrorBtn = useMemo(
    () => <Styled.Button onClick={onErrorHandler}>{intl.formatMessage({ id: 'common.retry' })}</Styled.Button>,
    [intl, onErrorHandler]
  )

  const renderSuccessExtra = useCallback(
    (txHash: string) => {
      const onClickHandler = () => successActionHandler(txHash)
      const txUrl = getExplorerTxUrl(txHash)
      return (
        <Styled.SuccessExtraContainer>
          <Styled.SuccessExtraButton onClick={onFinishHandler}>
            {intl.formatMessage({ id: 'common.back' })}
          </Styled.SuccessExtraButton>
          <ViewTxButton txHash={O.some(txHash)} onClick={onClickHandler} txUrl={txUrl} />
        </Styled.SuccessExtraContainer>
      )
    },
    [getExplorerTxUrl, intl, onFinishHandler, successActionHandler]
  )

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
    FP.pipe(
      targetPoolAddressRD,
      RD.toOption,
      O.map((poolAddress) => {
        reloadFeeHandler({ asset: runeAsset.asset, amount: amountToUpgrade, recipient: poolAddress.address })
        return true
      })
    )

    return false
  }, [targetPoolAddressRD, reloadFeeHandler, runeAsset.asset, amountToUpgrade])

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
        O.getOrElse<WalletType | 'custom'>(() => 'custom')
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

  const renderUpgradeForm = useMemo(
    () => (
      <CStyled.FormWrapper>
        <CStyled.FormContainer>
          <AccountSelector
            selectedWallet={{
              walletType,
              amount: assetToBase(assetAmount(0)),
              asset: runeAsset.asset,
              walletAddress: '',
              walletIndex
            }}
            walletBalances={[]}
            network={network}
          />
          <Styled.Form
            form={form}
            initialValues={{ amount: ZERO_BN, address: initialRuneNativeAddress }}
            onFinish={onSubmit}
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
                balance={{ amount: maxAmount, asset: runeAsset.asset }}
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
              <Styled.Button loading={isLoading} htmlType="submit" disabled={isDisabled}>
                {intl.formatMessage({ id: 'wallet.action.upgrade' })}
              </Styled.Button>
            </Styled.SubmitContainer>
          </Styled.Form>
        </CStyled.FormContainer>
      </CStyled.FormWrapper>
    ),
    [
      walletType,
      runeAsset.asset,
      walletIndex,
      network,
      form,
      initialRuneNativeAddress,
      onSubmit,
      intl,
      amountValidator,
      isLoading,
      onChangeInput,
      maxAmount,
      addMaxAmountHandler,
      selectedWalletType,
      targetWalletTypes,
      selectedWalletTypeChanged,
      addressValidator,
      onChangeTargetAddress,
      uiFeesRD,
      reloadFees,
      renderFeeError,
      txStatusMsg,
      isDisabled
    ]
  )

  const upgradeConfirmationHandler = useCallback(() => {
    // close confirmation modal
    setShowConfirmUpgradeModal(false)
    upgrade()
  }, [upgrade])

  const renderConfirmUpgradeModal = useMemo(
    () =>
      showConfirmUpgradeModal ? (
        <WalletPasswordConfirmationModal
          onSuccess={upgradeConfirmationHandler}
          onClose={() => setShowConfirmUpgradeModal(false)}
          validatePassword$={validatePassword$}
        />
      ) : (
        <></>
      ),
    [showConfirmUpgradeModal, upgradeConfirmationHandler, validatePassword$]
  )

  const renderUpgradeStatus = useMemo(
    () =>
      FP.pipe(
        upgradeTxState.status,
        RD.fold(
          () => renderUpgradeForm,
          () => renderUpgradeForm,
          (error) => (
            <CStyled.ErrorView
              title={intl.formatMessage({ id: 'wallet.upgrade.error' })}
              subTitle={error.msg}
              extra={renderErrorBtn}
            />
          ),
          (hash) => (
            <CStyled.SuccessView
              title={intl.formatMessage({ id: 'wallet.upgrade.success' })}
              extra={renderSuccessExtra(hash)}
            />
          )
        )
      ),
    [intl, renderErrorBtn, renderSuccessExtra, renderUpgradeForm, upgradeTxState]
  )

  return (
    <>
      {renderConfirmUpgradeModal}
      {FP.pipe(
        targetPoolAddressRD,
        RD.chain(
          RD.fromPredicate(
            ({ halted }) => !halted,
            () => new Error(intl.formatMessage({ id: 'pools.halted.chain' }, { chain: runeAsset.asset.chain }))
          )
        ),
        RD.fold(
          () => renderUpgradeStatus,
          () => renderUpgradeStatus,
          () => (
            <CStyled.ErrorView
              title={intl.formatMessage(
                { id: 'wallet.upgrade.error.loadPoolAddress' },
                { pool: runeAsset.asset.chain }
              )}
              extra={renderErrorBtn}
            />
          ),
          (_) => renderUpgradeStatus
        )
      )}
    </>
  )
}

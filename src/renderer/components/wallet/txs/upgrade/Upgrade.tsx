import React, { useMemo, useCallback, useState, useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getSwitchMemo } from '@thorchain/asgardex-util'
import { Address, TxParams } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, BaseAmount, baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { Network } from '../../../../../shared/api/types'
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
import { OpenExplorerTxUrl } from '../../../../services/clients'
import { PoolAddressRD } from '../../../../services/midgard/types'
import { NonEmptyWalletBalances, ValidatePasswordHandler } from '../../../../services/wallet/types'
import { AssetWithDecimal } from '../../../../types/asgardex'
import { PasswordModal } from '../../../modal/password'
import { MaxBalanceButton } from '../../../uielements/button/MaxBalanceButton'
import { ViewTxButton } from '../../../uielements/button/ViewTxButton'
import { UIFeesRD } from '../../../uielements/fees'
import { InputBigNumber } from '../../../uielements/input/InputBigNumber'
import { AccountSelector } from '../../account'
import * as Styled from '../TxForm.styles'
import { validateTxAmountInput } from '../TxForm.util'
import * as CStyled from './Upgrade.styles'

export type Props = {
  runeAsset: AssetWithDecimal
  walletAddress: Address
  runeNativeAddress: Address
  targetPoolAddressRD: PoolAddressRD
  validatePassword$: ValidatePasswordHandler
  fee: FeeRD
  upgrade$: (_: UpgradeRuneParams) => UpgradeRuneTxState$
  balances: O.Option<NonEmptyWalletBalances>
  reloadFeeHandler: (params: TxParams) => void
  successActionHandler: OpenExplorerTxUrl
  reloadBalancesHandler: FP.Lazy<void>
  network: Network
  reloadOnError: FP.Lazy<void>
}

type FormValues = {
  amount: BigNumber
}

const INITIAL_FORM_VALUES: FormValues = { amount: ZERO_BN }

export const Upgrade: React.FC<Props> = (props): JSX.Element => {
  const {
    runeAsset,
    runeNativeAddress,
    targetPoolAddressRD,
    validatePassword$,
    fee: feeRD,
    upgrade$,
    balances: oBalances,
    successActionHandler,
    reloadFeeHandler,
    reloadBalancesHandler,
    network,
    walletAddress,
    reloadOnError
  } = props

  const intl = useIntl()

  const [form] = Form.useForm<FormValues>()

  const [amountToUpgrade, setAmountToUpgrade] = useState<BaseAmount>(ZERO_BASE_AMOUNT)

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

  const onSubmit = useCallback(() => setShowConfirmUpgradeModal(true), [])

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
              memo: getSwitchMemo(runeNativeAddress),
              network
            })
          )
          return true
        })
      ),

    [runeNativeAddress, targetPoolAddressRD, upgrade$, amountToUpgrade, runeAsset, subscribeUpgradeTxState, network]
  )

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
    () => <Styled.Button onClick={onErrorHandler}>{intl.formatMessage({ id: 'common.back' })}</Styled.Button>,
    [intl, onErrorHandler]
  )

  const renderSuccessExtra = useCallback(
    (txHash: string) => {
      const onClickHandler = () => successActionHandler(txHash)
      return (
        <Styled.SuccessExtraContainer>
          <Styled.SuccessExtraButton onClick={onFinishHandler}>
            {intl.formatMessage({ id: 'common.back' })}
          </Styled.SuccessExtraButton>
          <ViewTxButton txHash={O.some(txHash)} onClick={onClickHandler} />
        </Styled.SuccessExtraContainer>
      )
    },
    [intl, onFinishHandler, successActionHandler]
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

  const renderUpgradeForm = useMemo(
    () => (
      <CStyled.FormWrapper>
        <CStyled.FormContainer>
          <AccountSelector selectedAsset={runeAsset.asset} walletBalances={[]} network={network} />
          <Styled.Form form={form} initialValues={INITIAL_FORM_VALUES} onFinish={onSubmit} labelCol={{ span: 24 }}>
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
      runeAsset.asset,
      network,
      form,
      onSubmit,
      intl,
      amountValidator,
      isLoading,
      onChangeInput,
      maxAmount,
      addMaxAmountHandler,
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
        <PasswordModal
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
            FP.not(({ halted }) => halted),
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

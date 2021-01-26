import React, { useMemo, useCallback, useState, useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getSwitchMemo } from '@thorchain/asgardex-util'
import { Address } from '@xchainjs/xchain-client'
import {
  Asset,
  assetAmount,
  AssetBNB,
  assetToBase,
  BaseAmount,
  baseToAsset,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
import { Row, Form, Col } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'

import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../../const'
import { getChainAsset } from '../../../../helpers/chainHelper'
import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { getBnbAmountFromBalances, getRuneBnBAmountFromBalances } from '../../../../helpers/walletHelper'
import { SendTxParams } from '../../../../services/binance/types'
import { FeeRD } from '../../../../services/chain/types'
import { PoolAddressRD } from '../../../../services/midgard/types'
import { NonEmptyWalletBalances, TxHashLD, TxHashRD, ValidatePasswordHandler } from '../../../../services/wallet/types'
import { PasswordModal } from '../../../modal/password'
import { ErrorView } from '../../../shared/error'
import { SuccessView } from '../../../shared/success'
import { Button } from '../../../uielements/button'
import { Fees, UIFeesRD } from '../../../uielements/fees'
import { InputBigNumber } from '../../../uielements/input/InputBigNumber'
import { AccountSelector } from '../../account'
import * as Styled from '../TxForm.style'
import { validateTxAmountInput } from '../TxForm.util'

type UpgradeTxState = {
  txRD: TxHashRD
}

/**
 * Upgrade wraps `UpgradeForm` to display states of `TxRD` while upgrading BNB.Rune:
 *
 * initial: UpgradeForm
 * pending: UpgradeForm (which handles a loading state itself)
 * failure: ErrorView
 * success: SuccessView
 *
 * */
export type Props = {
  runeAsset: Asset
  runeNativeAddress: Address
  bnbPoolAddressRD: PoolAddressRD
  validatePassword$: ValidatePasswordHandler
  fee: FeeRD
  sendUpgradeTx: (_: SendTxParams) => TxHashLD
  balances: O.Option<NonEmptyWalletBalances>
  reloadFeeHandler: FP.Lazy<void>
  successActionHandler?: (txHash: string) => Promise<void>
  errorActionHandler?: FP.Lazy<void>
}

type FormValues = {
  amount: BigNumber
}

const INITIAL_FORM_VALUES: FormValues = { amount: ZERO_BN }

export const Upgrade: React.FC<Props> = (props): JSX.Element => {
  const {
    runeAsset,
    runeNativeAddress,
    bnbPoolAddressRD,
    validatePassword$,
    fee: feeRD,
    sendUpgradeTx,
    balances: oBalances,
    successActionHandler = async () => Promise.resolve(),
    errorActionHandler = FP.constVoid,
    reloadFeeHandler
  } = props

  const intl = useIntl()

  const [form] = Form.useForm<FormValues>()

  // State for visibility of Modal to confirm upgrade
  const [showConfirmUpgradeModal, setShowConfirmUpgradeModal] = useState(false)
  // (Possible) subscription of upgrade tx
  const [upgradeTxSub, setUpgradeTxSub] = useState<O.Option<Rx.Subscription>>(O.none)
  // State of upgrade tx
  const [upgradeTxState, setUpgradeTxState] = useState<UpgradeTxState>({ txRD: RD.initial })
  const [amountToUpgrade, setAmountToUpgrade] = useState<BaseAmount>(ZERO_BASE_AMOUNT)

  // unsubscribe of (possible) previous subscription of upgrade tx
  // It will be called whenever state of `bnbTxSub` changed
  useEffect(() => {
    return () => {
      FP.pipe(
        upgradeTxSub,
        O.map((sub) => sub.unsubscribe())
      )
    }
  }, [upgradeTxSub])

  const oRuneBnbAmount: O.Option<BaseAmount> = useMemo(
    () => FP.pipe(oBalances, O.chain(FP.flow(getRuneBnBAmountFromBalances, O.map(assetToBase)))),
    [oBalances]
  )

  const oBnbAmount: O.Option<BaseAmount> = useMemo(
    () => FP.pipe(oBalances, O.chain(FP.flow(getBnbAmountFromBalances, O.map(assetToBase)))),
    [oBalances]
  )

  const maxAmount: BaseAmount = useMemo(
    () =>
      FP.pipe(
        oRuneBnbAmount,
        O.getOrElse(() => ZERO_BASE_AMOUNT)
      ),
    [oRuneBnbAmount]
  )

  useEffect(() => {
    setAmountToUpgrade(maxAmount)
  }, [maxAmount])

  useEffect(() => {
    form.setFieldsValue({
      amount: baseToAsset(amountToUpgrade).amount()
    })
  }, [amountToUpgrade, form])

  const amountValidator = useCallback(
    async (_: unknown, value: BigNumber) =>
      validateTxAmountInput({
        input: value,
        maxAmount: baseToAsset(maxAmount),
        errors: {
          msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
          msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
          msg3: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' })
        }
      }),
    [intl, maxAmount]
  )

  const onChangeInput = useCallback((value: BigNumber) => setAmountToUpgrade(assetToBase(assetAmount(value))), [])

  const onSubmit = useCallback(() => setShowConfirmUpgradeModal(true), [])

  const upgrade = useCallback(() => {
    FP.pipe(
      RD.toOption(bnbPoolAddressRD),
      O.map((bnbPoolAddress) => {
        const memo = getSwitchMemo(runeNativeAddress)
        const subscription = sendUpgradeTx({
          recipient: bnbPoolAddress,
          amount: amountToUpgrade,
          asset: runeAsset,
          memo
        }).subscribe((txRD) => {
          setUpgradeTxState({ txRD })
        })
        // store subscription
        setUpgradeTxSub(O.some(subscription))
        return true
      })
    )
  }, [amountToUpgrade, bnbPoolAddressRD, runeAsset, runeNativeAddress, sendUpgradeTx])

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

    return FP.pipe(
      sequenceTOption(oFee, oBnbAmount),
      O.map(([fee, bnbAmount]) => {
        const msg = intl.formatMessage(
          { id: 'wallet.upgrade.feeError' },
          {
            fee: formatAssetAmountCurrency({
              amount: baseToAsset(fee),
              asset: AssetBNB,
              trimZeros: true
            }),
            balance: formatAssetAmountCurrency({
              amount: baseToAsset(bnbAmount),
              asset: AssetBNB,
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
  }, [isFeeError, oFee, oBnbAmount, intl])

  const uiFeesRD: UIFeesRD = useMemo(
    () =>
      FP.pipe(
        feeRD,
        RD.map((fee) => [{ asset: getChainAsset(runeAsset.chain), amount: fee }])
      ),

    [feeRD, runeAsset.chain]
  )

  const renderErrorBtn = useMemo(
    () => (
      <Styled.Button onClick={() => errorActionHandler()}>{intl.formatMessage({ id: 'common.back' })}</Styled.Button>
    ),
    [errorActionHandler, intl]
  )

  const renderSuccessBtn = useCallback(
    (txHash: string) => (
      <Button round="true" onClick={() => successActionHandler(txHash)} sizevalue="normal">
        <Styled.ButtonLinkIcon />
        {intl.formatMessage({ id: 'common.transaction' })}
      </Button>
    ),
    [intl, successActionHandler]
  )

  const addMaxAmountHandler = useCallback(() => setAmountToUpgrade(maxAmount), [maxAmount])

  const isLoading = useMemo(() => RD.isPending(upgradeTxState.txRD), [upgradeTxState.txRD])

  const isDisabled: boolean = useMemo(
    () =>
      isFeeError ||
      FP.pipe(
        oRuneBnbAmount,
        O.map((amount) => amount.amount().isLessThanOrEqualTo(0) || RD.isPending(upgradeTxState.txRD)),
        O.getOrElse<boolean>(() => true)
      ),
    [isFeeError, oRuneBnbAmount, upgradeTxState.txRD]
  )

  const renderUpgradeForm = useMemo(
    () => (
      <Row>
        <Styled.Col span={24}>
          <AccountSelector selectedAsset={runeAsset} walletBalances={[]} />
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
                name="amount">
                <InputBigNumber size="large" disabled={isLoading} decimal={8} onChange={onChangeInput} />
              </Styled.FormItem>
              <Row align="middle">
                <Col>
                  <Styled.ButtonMax onClick={addMaxAmountHandler}>
                    {intl.formatMessage({ id: 'common.max' })}:
                  </Styled.ButtonMax>
                </Col>
                <Col flex="auto">
                  <Styled.Label size="big" style={{ paddingBottom: '0px' }}>
                    {formatAssetAmountCurrency({
                      amount: baseToAsset(maxAmount),
                      asset: runeAsset,
                      trimZeros: true
                    })}
                  </Styled.Label>
                </Col>
              </Row>
              <Row>
                <Fees fees={uiFeesRD} reloadFees={reloadFeeHandler} />
              </Row>
              {renderFeeError}
            </Styled.SubForm>
            <Styled.SubmitItem>
              <Styled.Button loading={isLoading} htmlType="submit" disabled={isDisabled}>
                {intl.formatMessage({ id: 'wallet.action.upgrade' })}
              </Styled.Button>
            </Styled.SubmitItem>
          </Styled.Form>
        </Styled.Col>
      </Row>
    ),
    [
      addMaxAmountHandler,
      amountValidator,
      form,
      intl,
      isDisabled,
      isLoading,
      maxAmount,
      onChangeInput,
      onSubmit,
      reloadFeeHandler,
      renderFeeError,
      runeAsset,
      uiFeesRD
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

  // Handle error of pool address

  const renderUpgradeStatus = useMemo(
    () =>
      FP.pipe(
        upgradeTxState.txRD,
        RD.fold(
          () => renderUpgradeForm,
          () => renderUpgradeForm,
          (error) => <ErrorView title={error.msg} extra={renderErrorBtn} />,
          (hash) => <SuccessView title={intl.formatMessage({ id: 'common.success' })} extra={renderSuccessBtn(hash)} />
        )
      ),
    [intl, renderErrorBtn, renderSuccessBtn, renderUpgradeForm, upgradeTxState.txRD]
  )

  return (
    <>
      {renderConfirmUpgradeModal}
      {FP.pipe(
        bnbPoolAddressRD,
        RD.fold(
          () => renderUpgradeStatus,
          () => renderUpgradeStatus,
          (error) => (
            <ErrorView
              // TODO (@Veado) Add i18n
              title="BNB pool address could not be loaded"
              subTitle={error?.message ?? ''}
              extra={renderErrorBtn}
            />
          ),
          (_) => renderUpgradeForm
        )
      )}
    </>
  )
}

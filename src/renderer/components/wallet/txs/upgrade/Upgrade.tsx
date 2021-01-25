import React, { useMemo, useCallback, useState, useEffect } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getSwitchMemo } from '@thorchain/asgardex-util'
import { Address } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetAmount,
  AssetBNB,
  baseAmount,
  BaseAmount,
  baseToAsset,
  bn,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
import { Row, Form } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'

import { ZERO_ASSET_AMOUNT } from '../../../../const'
import { getChainAsset } from '../../../../helpers/chainHelper'
import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { getBnbAmountFromBalances, getRuneBnBAmountFromBalances } from '../../../../helpers/walletHelper'
import { SendTxParams } from '../../../../services/binance/types'
import { FeeRD } from '../../../../services/chain/types'
import { GetExplorerTxUrl } from '../../../../services/clients'
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
  getExplorerTxUrl: GetExplorerTxUrl
  successActionHandler?: (txHash: string) => Promise<void>
  errorActionHandler?: FP.Lazy<void>
}

type FormValues = {
  amount: string
}

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

  const oRuneBnbAmount: O.Option<AssetAmount> = useMemo(
    () =>
      FP.pipe(
        oBalances,
        O.chain((balances) => getRuneBnBAmountFromBalances(balances))
      ),
    [oBalances]
  )

  const oBnbAmount: O.Option<AssetAmount> = useMemo(
    () =>
      FP.pipe(
        oBalances,
        O.chain((balances) => getBnbAmountFromBalances(balances))
      ),
    [oBalances]
  )

  const maxAmount: AssetAmount = useMemo(
    () =>
      FP.pipe(
        oRuneBnbAmount,
        O.getOrElse(() => ZERO_ASSET_AMOUNT)
      ),
    [oRuneBnbAmount]
  )

  const amountValidator = useCallback(
    async (_: unknown, value: BigNumber) =>
      validateTxAmountInput({
        input: value,
        maxAmount,
        errors: {
          msg1: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeNumber' }),
          msg2: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeGreaterThan' }, { amount: '0' }),
          msg3: intl.formatMessage({ id: 'wallet.errors.amount.shouldBeLessThanBalance' })
        }
      }),
    [intl, maxAmount]
  )

  const onSubmit = useCallback(
    ({ amount }: FormValues) => {
      FP.pipe(
        RD.toOption(bnbPoolAddressRD),
        O.map((bnbPoolAddress) => {
          const memo = getSwitchMemo(runeNativeAddress)
          const subscription = sendUpgradeTx({
            recipient: bnbPoolAddress,
            amount: baseAmount(amount),
            asset: runeAsset,
            memo
          }).subscribe((txRD) => {
            setUpgradeTxState({ txRD })
          })
          // store subscription
          setUpgradeTxSub(O.some(subscription))
        })
      )
    },
    [bnbPoolAddressRD, runeAsset, runeNativeAddress, sendUpgradeTx]
  )

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
              amount: bnbAmount,
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

  const renderUpgradeForm = useMemo(
    () => (
      <Row>
        <Styled.Col span={24}>
          <AccountSelector selectedAsset={runeAsset} walletBalances={[]} />
          <Styled.Form
            form={form}
            initialValues={{ amount: bn(0) }}
            onFinish={onSubmit}
            labelCol={{ span: 24 }}
            style={{ padding: '30px' }}>
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
                <InputBigNumber min={0} size="large" disabled={isLoading} decimal={8} />
              </Styled.FormItem>
              <Styled.Label size="big">
                {intl.formatMessage({ id: 'common.max' })}:{' '}
                {formatAssetAmountCurrency({
                  amount: maxAmount,
                  asset: runeAsset,
                  trimZeros: true
                })}
              </Styled.Label>
              <Styled.FeeRow>
                <Fees fees={uiFeesRD} reloadFees={reloadFeeHandler} />
              </Styled.FeeRow>
              {renderFeeError}
            </Styled.SubForm>
            <Styled.SubmitItem>
              <Styled.Button loading={isLoading} color="warning" disabled={isFeeError} htmlType="submit">
                {intl.formatMessage({ id: 'wallet.action.upgrade' })}
              </Styled.Button>
            </Styled.SubmitItem>
          </Styled.Form>
        </Styled.Col>
      </Row>
    ),
    [runeAsset]
  )

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
        upgradeTxState.status,
        RD.fold(
          () => renderUpgradeForm,
          () => renderUpgradeForm,
          (error) => <ErrorView title={error.msg} extra={renderErrorBtn} />,
          (hash) => <SuccessView title={intl.formatMessage({ id: 'common.success' })} extra={renderSuccessBtn(hash)} />
        )
      ),
    [intl, renderErrorBtn, renderSuccessBtn, renderUpgradeForm]
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

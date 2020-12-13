import React, { useState, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import {
  Asset,
  assetAmount,
  AssetRuneNative,
  assetToBase,
  baseAmount,
  BaseAmount,
  baseToAsset,
  formatAssetAmountCurrency,
  getValueOfAsset1InAsset2,
  PoolData
} from '@xchainjs/xchain-util'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { ZERO_BASE_AMOUNT } from '../../../const'
import { getChainAsset } from '../../../helpers/chainHelper'
import { eqAsset } from '../../../helpers/fp/eq'
import { sequenceTOption } from '../../../helpers/fpHelpers'
import { WithdrawFees, WithdrawFeesRD } from '../../../services/chain/types'
import { WithdrawType } from '../../../types/asgardex'
import { formatFee } from '../../uielements/fees/Fees.helper'
import { Label } from '../../uielements/label'
import { ReloadButton } from '../../uielements/reloadButton'
import { getWithdrawAmounts } from './Withdraw.helper'
import * as Styled from './Withdraw.styles'

type Props = {
  /** Type to withdraw (`sym` or `asym`) */
  type: WithdrawType
  /** Asset to withdraw */
  asset: Asset
  /** Rune price */
  runePrice: BigNumber
  /** Asset based `PoolData` */
  assetPoolData: PoolData
  /** Asset price */
  assetPrice: BigNumber
  /** `PoolData` of assets chain asset */
  chainAssetPoolData: PoolData
  /** Wallet balance of Rune */
  runeBalance: O.Option<BaseAmount>
  /** Selected price asset */
  selectedPriceAsset: Asset
  /** Callback to send withdraw tx */
  onWithdraw: (percent: number) => void
  /** Callback to reload fees */
  reloadFees: () => void
  /** Share of Rune */
  runeShare: BaseAmount
  /** Share of selected Asset */
  assetShare: BaseAmount
  /** Flag whether form has to be disabled or not */
  disabled?: boolean
  /** Fees needed to withdraw */
  fees: WithdrawFeesRD
}

export const Withdraw: React.FC<Props> = ({
  type,
  asset,
  assetPoolData,
  onWithdraw,
  asset: depositAsset,
  runePrice,
  assetPrice,
  chainAssetPoolData,
  runeBalance: oRuneBalance,
  selectedPriceAsset,
  runeShare,
  assetShare,
  disabled,
  fees,
  reloadFees: updateFees
}) => {
  const intl = useIntl()
  const [withdrawPercent, setWithdrawPercent] = useState(disabled ? 0 : 50)

  const _isAsym = useMemo(() => type === 'asym', [type])

  const withdrawAmounts = getWithdrawAmounts(runeShare, assetShare, withdrawPercent)

  const oFees: O.Option<WithdrawFees> = useMemo(() => FP.pipe(fees, RD.toOption), [fees])

  const isThorMemoFeeError: boolean = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(oFees, oRuneBalance),
        O.fold(
          // Missing (or loading) fees does not mean we can't sent something. No error then.
          () => !O.isNone(oFees),
          ([{ thorMemo }, balance]) => balance.amount().isLessThan(thorMemo.amount())
        )
      ),
    [oFees, oRuneBalance]
  )

  const renderThorMemoFeeError = useMemo(() => {
    const runeBalance = FP.pipe(
      oRuneBalance,
      O.getOrElse(() => ZERO_BASE_AMOUNT),
      baseToAsset
    )

    return FP.pipe(
      oFees,
      O.map(({ thorMemo }) => {
        const thorFeesAmount: BaseAmount = baseAmount(thorMemo.amount())
        const msg = intl.formatMessage(
          { id: 'deposit.withdraw.add.error.thorMemoFeeNotCovered' },
          {
            fee: formatAssetAmountCurrency({
              amount: baseToAsset(thorFeesAmount),
              asset: AssetRuneNative,
              trimZeros: true
            }),
            balance: formatAssetAmountCurrency({ amount: runeBalance, asset: AssetRuneNative, trimZeros: true })
          }
        )
        // It seems `key`  has to be set for any reason to avoid "Missing "key" prop for element in iterator"
        return <Styled.FeeErrorLabel key="memo-fee-error">{msg}</Styled.FeeErrorLabel>
      }),
      O.getOrElse(() => <></>)
    )
  }, [oRuneBalance, oFees, intl])

  /**
   * Calculated asset chain fee in price of asset
   */
  const oAssetChainFeePrice: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        oFees,
        O.map(({ assetOut }) => getValueOfAsset1InAsset2(assetOut, assetPoolData, chainAssetPoolData))
      ),
    [oFees, assetPoolData, chainAssetPoolData]
  )

  const isAssetChainFeeError = useMemo(() => {
    return FP.pipe(
      oAssetChainFeePrice,
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFees),
        (assetOutFeePrice) => assetToBase(withdrawAmounts.assetWithdraw).amount().isLessThan(assetOutFeePrice.amount())
      )
    )
  }, [oAssetChainFeePrice, oFees, withdrawAmounts.assetWithdraw])

  const renderAssetChainFeeError = useMemo(() => {
    return FP.pipe(
      oAssetChainFeePrice,
      O.map((fee) => {
        const msg = intl.formatMessage(
          { id: 'deposit.withdraw.add.error.outFeeNotCovered' },
          {
            fee: formatAssetAmountCurrency({
              amount: baseToAsset(fee),
              asset,
              trimZeros: true
            }),
            balance: formatAssetAmountCurrency({ amount: withdrawAmounts.assetWithdraw, asset, trimZeros: true })
          }
        )
        // It seems `key`  has to be set for any reason to avoid "Missing "key" prop for element in iterator"
        return <Styled.FeeErrorLabel key="asset-fee-out-error">{msg}</Styled.FeeErrorLabel>
      }),
      O.getOrElse(() => <></>)
    )
  }, [oAssetChainFeePrice, intl, asset, withdrawAmounts])

  const isThorOutFeeError = useMemo(() => {
    return FP.pipe(
      oFees,
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFees),
        ({ thorOut }) => assetToBase(withdrawAmounts.runeWithdraw).amount().isLessThan(thorOut.amount())
      )
    )
  }, [oFees, withdrawAmounts])

  const renderThorOutFeeError = useMemo(() => {
    return FP.pipe(
      oFees,
      O.map(({ thorOut }) => {
        const msg = intl.formatMessage(
          { id: 'deposit.withdraw.add.error.outFeeNotCovered' },
          {
            fee: formatAssetAmountCurrency({
              amount: baseToAsset(thorOut),
              asset: AssetRuneNative,
              trimZeros: true
            }),
            balance: formatAssetAmountCurrency({
              amount: withdrawAmounts.runeWithdraw,
              asset: AssetRuneNative,
              trimZeros: true
            })
          }
        )
        // It seems `key`  has to be set for any reason to avoid "Missing "key" prop for element in iterator"
        return <Styled.FeeErrorLabel key="thor-fee-out-error">{msg}</Styled.FeeErrorLabel>
      }),
      O.getOrElse(() => <></>)
    )
  }, [oFees, intl, withdrawAmounts.runeWithdraw])

  const renderFee = useMemo(() => {
    const loading = <>{intl.formatMessage({ id: 'common.fees' })}: ...</>
    return FP.pipe(
      fees,
      RD.fold(
        () => loading,
        () => loading,
        (error) => (
          <Styled.FeeErrorLabel key="memo-error">
            {intl.formatMessage({ id: 'common.error' })} {error?.message ?? ''}
          </Styled.FeeErrorLabel>
        ),
        ({ thorMemo, assetOut, thorOut }) => (
          <Styled.FeeLabel>
            {intl.formatMessage({ id: 'common.fees' })}
            {': '}
            {formatFee({
              amount: thorMemo,
              asset: AssetRuneNative
            })}
            {' + '}
            {formatFee({
              amount: getValueOfAsset1InAsset2(assetOut, assetPoolData, chainAssetPoolData),
              asset: getChainAsset(asset.chain)
            })}
            {' + '}
            {formatFee({
              amount: thorOut,
              asset: AssetRuneNative
            })}
          </Styled.FeeLabel>
        )
      )
    )
  }, [asset, assetPoolData, chainAssetPoolData, fees, intl])

  const disabledForm = useMemo(() => withdrawPercent === 0 || disabled || isThorMemoFeeError || isAssetChainFeeError, [
    withdrawPercent,
    disabled,
    isThorMemoFeeError,
    isAssetChainFeeError
  ])

  return (
    <Styled.Container>
      <Label weight="bold" textTransform="uppercase">
        {intl.formatMessage({ id: 'deposit.withdraw.title' })}
      </Label>
      <Label>{intl.formatMessage({ id: 'deposit.withdraw.choseText' })}</Label>

      <Styled.Slider
        key={'asset amount slider'}
        value={withdrawPercent}
        onChange={setWithdrawPercent}
        disabled={disabledForm}
      />
      <Label weight={'bold'} textTransform={'uppercase'}>
        {intl.formatMessage({ id: 'deposit.withdraw.receiveText' })}
      </Label>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={AssetRuneNative} />
        <Styled.OutputLabel weight={'bold'}>
          {formatAssetAmountCurrency({
            amount: withdrawAmounts.runeWithdraw,
            asset: AssetRuneNative,
            trimZeros: true
          })}
          {/* show pricing if price asset is different only */}
          {!eqAsset.equals(AssetRuneNative, selectedPriceAsset) &&
            ` (${formatAssetAmountCurrency({
              amount: assetAmount(withdrawAmounts.runeWithdraw.amount().times(runePrice)),
              asset: selectedPriceAsset,
              trimZeros: true
            })})`}
        </Styled.OutputLabel>
      </Styled.AssetContainer>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={depositAsset} />
        <Styled.OutputLabel weight={'bold'}>
          {formatAssetAmountCurrency({
            amount: withdrawAmounts.assetWithdraw,
            asset: depositAsset,
            trimZeros: true
          })}
          {/* show pricing if price asset is different only */}
          {!eqAsset.equals(depositAsset, selectedPriceAsset) &&
            ` (${formatAssetAmountCurrency({
              amount: assetAmount(withdrawAmounts.assetWithdraw.amount().times(assetPrice)),
              asset: selectedPriceAsset,
              trimZeros: true
            })})`}
        </Styled.OutputLabel>
      </Styled.AssetContainer>

      <Styled.FeesRow gutter={{ lg: 32 }}>
        <Col xs={24} xl={12}>
          <Styled.FeeRow>
            <Col>
              <ReloadButton onClick={updateFees} disabled={RD.isPending(fees)} />
            </Col>
            <Col>
              <Styled.FeeLabel disabled={RD.isPending(fees)}>{renderFee}</Styled.FeeLabel>
            </Col>
          </Styled.FeeRow>
          <Styled.FeeErrorRow>
            <Col>
              <>
                {!!isThorMemoFeeError && renderThorMemoFeeError}
                {!!isThorOutFeeError && renderThorOutFeeError}
                {!!isAssetChainFeeError && renderAssetChainFeeError}
              </>
            </Col>
          </Styled.FeeErrorRow>
        </Col>
      </Styled.FeesRow>

      <Styled.Drag
        title={intl.formatMessage({ id: 'deposit.withdraw.drag' })}
        onConfirm={() => onWithdraw(withdrawPercent)}
        disabled={disabledForm}
      />
    </Styled.Container>
  )
}

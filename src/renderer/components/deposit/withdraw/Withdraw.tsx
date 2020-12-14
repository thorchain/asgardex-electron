import React, { useState, useMemo, useCallback } from 'react'

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
import { Col, Grid } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { ZERO_ASSET_AMOUNT } from '../../../const'
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

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const [withdrawPercent, setWithdrawPercent] = useState(disabled ? 0 : 50)

  const _isAsym = useMemo(() => type === 'asym', [type])

  const withdrawAmounts = getWithdrawAmounts(runeShare, assetShare, withdrawPercent)

  const oFees: O.Option<WithdrawFees> = useMemo(() => FP.pipe(fees, RD.toOption), [fees])

  const isThorMemoFeeError: boolean = useMemo(() => {
    if (withdrawPercent <= 0) return false

    return FP.pipe(
      sequenceTOption(oFees, oRuneBalance),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFees),
        ([{ thorMemo }, balance]) => balance.amount().isLessThan(thorMemo.amount())
      )
    )
  }, [oFees, oRuneBalance, withdrawPercent])

  const renderThorMemoFeeError = useMemo(() => {
    if (!isThorMemoFeeError) return <></>

    const runeBalance = FP.pipe(
      oRuneBalance,
      O.map(baseToAsset),
      O.getOrElse(() => ZERO_ASSET_AMOUNT)
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
        // `key`  has to be set for any reason to avoid "Missing "key" prop for element in iterator"
        return <Styled.FeeErrorLabel key="memo2-fee-error">{msg}</Styled.FeeErrorLabel>
      }),
      O.getOrElse(() => <></>)
    )
  }, [isThorMemoFeeError, oRuneBalance, oFees, intl])

  /**
   * Helper to calculate chain fee
   * Fee might be calculated into price of asset
   */
  const calculateAssetChainFee = useCallback(
    (fee: BaseAmount): BaseAmount => {
      // ignore price calculations for assets, which are chain assets
      if (eqAsset.equals(asset, getChainAsset(asset.chain))) return fee
      // calculate asset price of fee
      return getValueOfAsset1InAsset2(fee, assetPoolData, chainAssetPoolData)
    },
    [asset, assetPoolData, chainAssetPoolData]
  )
  /**
   * Asset chain fee
   */
  const oAssetChainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        oFees,
        O.map(({ assetOut }) => calculateAssetChainFee(assetOut))
      ),
    [calculateAssetChainFee, oFees]
  )

  const isAssetChainFeeError = useMemo(() => {
    if (withdrawPercent <= 0) return false

    return FP.pipe(
      oAssetChainFee,
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFees),
        (fee) => assetToBase(withdrawAmounts.assetWithdraw).amount().isLessThan(fee.amount())
      )
    )
  }, [oAssetChainFee, oFees, withdrawAmounts.assetWithdraw, withdrawPercent])

  const renderAssetChainFeeError = useMemo(() => {
    if (!isAssetChainFeeError) return <></>

    return FP.pipe(
      oAssetChainFee,
      O.map((fee) => {
        const msg = intl.formatMessage(
          { id: 'deposit.withdraw.add.error.outFeeNotCovered' },
          {
            fee: formatAssetAmountCurrency({
              amount: baseToAsset(fee),
              asset,
              trimZeros: true
            }),
            amount: formatAssetAmountCurrency({ amount: withdrawAmounts.assetWithdraw, asset, trimZeros: true })
          }
        )
        // `key`  has to be set for any reason to avoid "Missing "key" prop for element in iterator"
        return <Styled.FeeErrorLabel key="asset-fee-out-error">{msg}</Styled.FeeErrorLabel>
      }),
      O.getOrElse(() => <></>)
    )
  }, [isAssetChainFeeError, oAssetChainFee, intl, asset, withdrawAmounts.assetWithdraw])

  const isThorOutFeeError = useMemo(() => {
    if (withdrawPercent <= 0) return false
    return FP.pipe(
      oFees,
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFees),
        ({ thorOut }) => assetToBase(withdrawAmounts.runeWithdraw).amount().isLessThan(thorOut.amount())
      )
    )
  }, [oFees, withdrawAmounts.runeWithdraw, withdrawPercent])

  const renderThorOutFeeError = useMemo(() => {
    if (!isThorOutFeeError) return <></>

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
            amount: formatAssetAmountCurrency({
              amount: withdrawAmounts.runeWithdraw,
              asset: AssetRuneNative,
              trimZeros: true
            })
          }
        )
        // `key`  has to be set for any reason to avoid "Missing "key" prop for element in iterator"
        return <Styled.FeeErrorLabel key="thor-fee-out-error">{msg}</Styled.FeeErrorLabel>
      }),
      O.getOrElse(() => <></>)
    )
  }, [isThorOutFeeError, oFees, intl, withdrawAmounts.runeWithdraw])

  const renderFee = useMemo(() => {
    const loading = <>...</>
    return FP.pipe(
      fees,
      RD.fold(
        () => loading,
        () => loading,
        (error) => (
          <>
            {intl.formatMessage({ id: 'common.error' })} {error?.message ?? ''}
          </>
        ),
        ({ thorMemo, thorOut, assetOut }) => {
          const formattedThorMemoFee = formatFee({
            amount: thorMemo,
            asset: AssetRuneNative
          })
          const formattedAssetOutFee = formatFee({
            amount: calculateAssetChainFee(assetOut),
            asset
          })
          const formattedThorOutFee = formatFee({
            amount: thorOut,
            asset: AssetRuneNative
          })

          if (!isDesktopView) {
            return `${intl.formatMessage({
              id: 'common.fees'
            })}: ${formattedThorMemoFee} + ${formattedThorOutFee} + ${formattedAssetOutFee}`
          }

          return (
            <>
              {intl.formatMessage(
                { id: 'deposit.withdraw.fees' },
                { thorMemo: formattedThorMemoFee, assetOut: formattedAssetOutFee, thorOut: formattedThorOutFee }
              )}
            </>
          )
        }
      )
    )
  }, [asset, calculateAssetChainFee, fees, intl, isDesktopView])

  const disabledForm = useMemo(() => withdrawPercent <= 0 || disabled, [withdrawPercent, disabled])

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
        <Styled.AssetIcon asset={asset} />
        <Styled.OutputLabel weight={'bold'}>
          {formatAssetAmountCurrency({
            amount: withdrawAmounts.assetWithdraw,
            asset: asset,
            trimZeros: true
          })}
          {/* show pricing if price asset is different only */}
          {!eqAsset.equals(asset, selectedPriceAsset) &&
            ` (${formatAssetAmountCurrency({
              amount: assetAmount(withdrawAmounts.assetWithdraw.amount().times(assetPrice)),
              asset: selectedPriceAsset,
              trimZeros: true
            })})`}
        </Styled.OutputLabel>
      </Styled.AssetContainer>

      <Styled.FeesRow gutter={{ lg: 32 }}>
        <Col>
          <Styled.FeeRow>
            <Col>
              <ReloadButton onClick={updateFees} disabled={RD.isPending(fees)} />
            </Col>
            <Col>
              <Styled.FeeLabel disabled={RD.isPending(fees)} color={RD.isFailure(fees) ? 'error' : 'normal'}>
                {renderFee}
              </Styled.FeeLabel>
            </Col>
          </Styled.FeeRow>
          <Styled.FeeErrorRow>
            <Col>
              <>
                {renderThorMemoFeeError}
                {renderThorOutFeeError}
                {renderAssetChainFeeError}
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

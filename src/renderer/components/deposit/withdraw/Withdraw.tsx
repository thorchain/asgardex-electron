import React, { useState, useMemo, useCallback } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import {
  Asset,
  AssetAmount,
  assetAmount,
  AssetRuneNative,
  BaseAmount,
  baseToAsset,
  formatAssetAmountCurrency
} from '@xchainjs/xchain-util'
import { Row } from 'antd'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { ZERO_BASE_AMOUNT } from '../../../const'
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
  type: WithdrawType
  asset: Asset
  runePrice: BigNumber
  assetPrice: BigNumber
  chainAssetBalance: O.Option<BaseAmount>
  runeBalance: O.Option<BaseAmount>
  selectedCurrencyAsset: Asset
  onWithdraw: (percent: number) => void
  updateFees: () => void
  runeShare: BaseAmount
  assetShare: BaseAmount
  disabled?: boolean
  fees: WithdrawFeesRD
}

export const Withdraw: React.FC<Props> = ({
  type,
  asset,
  onWithdraw,
  asset: depositAsset,
  runePrice,
  assetPrice,
  chainAssetBalance: oChainAssetBalance,
  runeBalance: oRuneBalance,
  selectedCurrencyAsset,
  runeShare,
  assetShare,
  disabled,
  fees,
  updateFees
}) => {
  const intl = useIntl()
  const [withdrawPercent, setWithdrawPercent] = useState(disabled ? 0 : 50)

  const _isAsym = useMemo(() => type === 'asym', [type])

  const withdrawAmounts = getWithdrawAmounts(runeShare, assetShare, withdrawPercent)

  const renderFee = useMemo(
    () => [
      FP.pipe(
        fees,
        RD.fold(
          () => '...',
          () => '...',
          (error) => `${intl.formatMessage({ id: 'common.error' })} ${error?.message ?? ''}`,
          ({ thorMemo, assetOut, thorOut }) =>
            `${formatFee({
              amount: thorMemo,
              asset: AssetRuneNative
            })} + ${formatFee({
              amount: assetOut,
              asset
            })} + thorOut: ${thorOut.amount()} +`
        )
      )
    ],
    [asset, fees, intl]
  )

  const oFees: O.Option<WithdrawFees> = useMemo(() => FP.pipe(fees, RD.toOption), [fees])

  const renderFeeError = useCallback(
    (fee: BaseAmount, balance: AssetAmount, asset: Asset): JSX.Element => {
      const msg = intl.formatMessage(
        { id: 'deposit.add.error.chainFeeNotCovered' },
        {
          fee: formatAssetAmountCurrency({
            amount: baseToAsset(fee),
            asset,
            trimZeros: true
          }),
          balance: formatAssetAmountCurrency({ amount: balance, asset, trimZeros: true })
        }
      )

      return <Styled.FeeErrorLabel>{msg}</Styled.FeeErrorLabel>
    },
    [intl]
  )

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
    const amount = FP.pipe(
      oRuneBalance,
      O.getOrElse(() => ZERO_BASE_AMOUNT),
      baseToAsset
    )

    return FP.pipe(
      oFees,
      O.map(({ thorMemo }) => renderFeeError(thorMemo, amount, AssetRuneNative)),
      O.getOrElse(() => <></>)
    )
  }, [oRuneBalance, oFees, renderFeeError])

  const isAssetOutFeeError = useMemo(() => {
    return FP.pipe(
      sequenceTOption(oFees, oChainAssetBalance),
      O.fold(
        // Missing (or loading) fees does not mean we can't sent something. No error then.
        () => !O.isNone(oFees),
        ([{ assetOut }, balance]) => balance.amount().isLessThan(assetOut.amount())
      )
    )
  }, [oChainAssetBalance, oFees])

  const renderAssetOutFeeError = useMemo(() => {
    const amount = FP.pipe(
      oChainAssetBalance,
      O.getOrElse(() => ZERO_BASE_AMOUNT),
      baseToAsset
    )

    return FP.pipe(
      oFees,
      O.map(({ assetOut }) => renderFeeError(assetOut, amount, asset)),
      O.getOrElse(() => <></>)
    )
  }, [oChainAssetBalance, oFees, renderFeeError, asset])

  const disabledForm = useMemo(() => withdrawPercent === 0 || disabled || isThorMemoFeeError || isAssetOutFeeError, [
    withdrawPercent,
    disabled,
    isThorMemoFeeError,
    isAssetOutFeeError
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
          {!eqAsset.equals(AssetRuneNative, selectedCurrencyAsset) &&
            ` (${formatAssetAmountCurrency({
              amount: assetAmount(withdrawAmounts.runeWithdraw.amount().times(runePrice)),
              asset: selectedCurrencyAsset,
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
          {!eqAsset.equals(depositAsset, selectedCurrencyAsset) &&
            ` (${formatAssetAmountCurrency({
              amount: assetAmount(withdrawAmounts.assetWithdraw.amount().times(assetPrice)),
              asset: selectedCurrencyAsset,
              trimZeros: true
            })})`}
        </Styled.OutputLabel>
      </Styled.AssetContainer>

      <Label disabled={RD.isPending(fees)}>
        <Row align="middle">
          <ReloadButton onClick={updateFees} disabled={RD.isPending(fees)} />
          {renderFee}
        </Row>
      </Label>

      <Row>
        <Col>
          <>{!!isThorMemoFeeError && renderThorMemoFeeError}</>
          <>{!!isAssetOutFeeError && renderAssetOutFeeError}</>
        </Col>
      </Row>

      <Styled.Drag
        title={intl.formatMessage({ id: 'deposit.withdraw.drag' })}
        onConfirm={() => onWithdraw(withdrawPercent)}
        disabled={disabledForm}
      />
    </Styled.Container>
  )
}

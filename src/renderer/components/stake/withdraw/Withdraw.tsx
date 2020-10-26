import React, { useState, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, assetAmount, BaseAmount, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { BASE_CHAIN_ASSET } from '../../../const'
import { eqAsset } from '../../../helpers/fp/eq'
import { StakeFeesRD } from '../../../services/chain/types'
import { Fees } from '../../uielements/fees'
import { Label } from '../../uielements/label'
import { getWithdrawAmounts } from './Withdraw.helper'
import * as Styled from './Withdraw.styles'

type Props = {
  stakedAsset: Asset
  runeAsset: Asset
  runePrice: BigNumber
  assetPrice: BigNumber
  selectedCurrencyAsset: Asset
  onWithdraw: (percent: number) => void
  runeShare: BaseAmount
  assetShare: BaseAmount
  disabled?: boolean
  fees: StakeFeesRD
}

export const Withdraw: React.FC<Props> = ({
  onWithdraw,
  stakedAsset,
  runeAsset,
  runePrice,
  assetPrice,
  selectedCurrencyAsset,
  runeShare,
  assetShare,
  disabled,
  fees: feesProp
}) => {
  const intl = useIntl()
  const [withdrawPercent, setWithdrawPercent] = useState(50)

  const withdrawAmounts = getWithdrawAmounts(runeShare, assetShare, withdrawPercent)
  const fees = useMemo(
    () =>
      FP.pipe(
        feesProp,
        RD.map((fees) =>
          FP.pipe(
            fees.cross,
            O.fold(
              () => [
                {
                  asset: BASE_CHAIN_ASSET,
                  amount: fees.base
                }
              ],
              (xFee) => [
                {
                  asset: BASE_CHAIN_ASSET,
                  amount: fees.base
                },
                {
                  asset: stakedAsset,
                  amount: xFee
                }
              ]
            )
          )
        )
      ),
    [feesProp, stakedAsset]
  )

  return (
    <Styled.Container>
      <Label weight="bold" textTransform="uppercase">
        {intl.formatMessage({ id: 'stake.withdraw.title' })}
      </Label>
      <Label>{intl.formatMessage({ id: 'stake.withdraw.choseText' })}</Label>

      <Styled.Slider
        key={'asset amount slider'}
        value={withdrawPercent}
        onChange={setWithdrawPercent}
        disabled={disabled}
      />
      <Label weight={'bold'} textTransform={'uppercase'}>
        {intl.formatMessage({ id: 'stake.withdraw.receiveText' })}
      </Label>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={runeAsset} />
        <Styled.OutputLabel weight={'bold'}>
          {formatAssetAmountCurrency({
            amount: withdrawAmounts.runeWithdraw,
            asset: runeAsset,
            trimZeros: true
          })}
          {/* show pricing if price asset is different only */}
          {!eqAsset.equals(runeAsset, selectedCurrencyAsset) &&
            ` (${formatAssetAmountCurrency({
              amount: assetAmount(withdrawAmounts.runeWithdraw.amount().times(runePrice)),
              asset: selectedCurrencyAsset,
              trimZeros: true
            })})`}
        </Styled.OutputLabel>
      </Styled.AssetContainer>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={stakedAsset} />
        <Styled.OutputLabel weight={'bold'}>
          {formatAssetAmountCurrency({
            amount: withdrawAmounts.assetWithdraw,
            asset: stakedAsset,
            trimZeros: true
          })}
          {/* show pricing if price asset is different only */}
          {!eqAsset.equals(stakedAsset, selectedCurrencyAsset) &&
            ` (${formatAssetAmountCurrency({
              amount: assetAmount(withdrawAmounts.assetWithdraw.amount().times(assetPrice)),
              asset: selectedCurrencyAsset,
              trimZeros: true
            })})`}
        </Styled.OutputLabel>
      </Styled.AssetContainer>

      <Label>
        <Fees fees={fees} />
      </Label>

      <Styled.Drag
        title={intl.formatMessage({ id: 'stake.withdraw.drag' })}
        source={runeAsset}
        target={stakedAsset}
        onConfirm={() => onWithdraw(withdrawPercent)}
        // @TODO (@thatStrangeGuy) compare to BNB fee
        disabled={withdrawPercent === 0 || disabled}
      />
    </Styled.Container>
  )
}

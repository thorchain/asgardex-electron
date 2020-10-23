import React, { useState } from 'react'

import { Asset, assetAmount, formatAssetAmount, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

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
  runeShare: BigNumber
  assetShare: BigNumber
}

export const Withdraw: React.FC<Props> = ({
  onWithdraw,
  stakedAsset,
  runeAsset,
  runePrice,
  assetPrice,
  selectedCurrencyAsset,
  runeShare,
  assetShare
}) => {
  const intl = useIntl()
  const [withdrawPercent, setWithdrawPercent] = useState(50)

  const withdrawAmounts = getWithdrawAmounts(runeShare, assetShare, withdrawPercent)

  return (
    <Styled.Container>
      <Label weight="bold" textTransform="uppercase">
        {intl.formatMessage({ id: 'stake.withdraw.title' })}
      </Label>
      <Label>{intl.formatMessage({ id: 'stake.withdraw.choseText' })}</Label>

      <Styled.Slider key={'asset amount slider'} value={withdrawPercent} onChange={setWithdrawPercent} />
      <Label weight={'bold'} textTransform={'uppercase'}>
        {intl.formatMessage({ id: 'stake.withdraw.receiveText' })}
      </Label>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={runeAsset} />
        <Label weight={'bold'}>
          {runeAsset.ticker} {formatAssetAmount({ amount: withdrawAmounts.runeWithdraw, decimal: 2 })}(
          {formatAssetAmountCurrency({
            amount: assetAmount(withdrawAmounts.runeWithdraw.amount().times(runePrice)),
            asset: selectedCurrencyAsset,
            trimZeros: true
          })}
          )
        </Label>
      </Styled.AssetContainer>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={stakedAsset} />
        <Label weight={'bold'}>
          {stakedAsset.ticker} {formatAssetAmount({ amount: withdrawAmounts.assetWithdraw, decimal: 2 })}(
          {formatAssetAmountCurrency({
            amount: assetAmount(withdrawAmounts.assetWithdraw.amount().times(assetPrice)),
            asset: selectedCurrencyAsset,
            trimZeros: true
          })}
          )
        </Label>
      </Styled.AssetContainer>

      <Label>{intl.formatMessage({ id: 'stake.withdraw.fee' })}: 0.000375 BNB</Label>

      <Styled.Drag
        title={intl.formatMessage({ id: 'stake.withdraw.drag' })}
        source={runeAsset}
        target={stakedAsset}
        onConfirm={() => onWithdraw(withdrawPercent)}
        // @TODO (@thatStrangeGuy) compare to BNB fee
        disabled={withdrawPercent === 0}
      />
    </Styled.Container>
  )
}

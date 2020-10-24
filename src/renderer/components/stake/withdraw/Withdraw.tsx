import React, { useState } from 'react'

import { Asset, assetAmount, BaseAmount, formatAssetAmountCurrency } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { eqAsset } from '../../../helpers/fp/eq'
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
  disabled
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

      <Label>{intl.formatMessage({ id: 'stake.withdraw.fee' })}: 0.000375 BNB</Label>

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

import React, { useCallback, useState } from 'react'

import { Asset, formatAssetAmount } from '@thorchain/asgardex-util'
import { useIntl } from 'react-intl'

import { PoolDetail, StakersAssetData } from '../../../types/generated/midgard/models'
import { Label } from '../../uielements/label'
import { getWithdrawAmountsFactory } from './Withdraw.helper'
import * as Styled from './Withdraw.styles'

type Props = {
  stakedAsset: Asset
  runeAsset: Asset
  poolDetail: PoolDetail
  stakersAssetData: StakersAssetData
  onWithdraw: (percent: number) => void
}

export const Withdraw: React.FC<Props> = ({ onWithdraw, stakedAsset, runeAsset, poolDetail, stakersAssetData }) => {
  const intl = useIntl()
  const [withdrawPercent, setWithdrawPercent] = useState(50)

  const getWithdrawAmounts = useCallback(getWithdrawAmountsFactory(poolDetail, stakersAssetData), [
    poolDetail,
    stakersAssetData
  ])
  const withdrawAmounts = getWithdrawAmounts(withdrawPercent)

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
          {runeAsset.ticker} {formatAssetAmount({ amount: withdrawAmounts.runeWithdraw, decimal: 2 })}
        </Label>
      </Styled.AssetContainer>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={stakedAsset} />
        <Label weight={'bold'}>
          {stakedAsset.ticker} {formatAssetAmount({ amount: withdrawAmounts.assetWithdraw, decimal: 2 })}
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

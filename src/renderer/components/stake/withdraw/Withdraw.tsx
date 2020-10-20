import React, { useState } from 'react'
import * as Styled from './Withdraw.styles'
import { Asset, BaseAmount } from '@thorchain/asgardex-util'
import { useIntl } from 'react-intl'
import Label from '../../uielements/label'
import Slider from '../../uielements/slider'
import Drag from '../../uielements/drag'

type Props = {
  runeStakedAmount: BaseAmount
  assetStakedAmount: BaseAmount
  stakedAsset: Asset
  runeAsset: Asset
  onWithdraw: (asset: Asset, amount: BaseAmount) => void
}

export const Withdraw: React.FC<Props> = ({ stakedAsset, runeAsset }) => {
  const intl = useIntl()
  const [withdrawPercent, setWithdrawPercent] = useState(50)

  return (
    <Styled.Container>
      <Label weight="bold" textTransform="uppercase">
        {intl.formatMessage({ id: 'stake.withdraw.title' })}
      </Label>
      <Label>{intl.formatMessage({ id: 'stake.withdraw.choseText' })}</Label>

      <Slider
        key={'asset amount slider'}
        value={withdrawPercent}
        onChange={setWithdrawPercent}
        tooltipPlacement="bottom"
        withLabel={true}
      />
      <Label textTransform={'uppercase'}>{intl.formatMessage({ id: 'stake.withdraw.receiveText' })}</Label>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={runeAsset} />
        <Label>{runeAsset.ticker} asdad</Label>
      </Styled.AssetContainer>

      <Styled.AssetContainer>
        <Styled.AssetIcon asset={stakedAsset} />
        <Label>{stakedAsset.ticker} asdad</Label>
      </Styled.AssetContainer>

      <Drag
        title={intl.formatMessage({ id: 'stake.withdraw.drag' })}
        source={runeAsset}
        target={stakedAsset}
        onConfirm={console.log}
      />
    </Styled.Container>
  )
}

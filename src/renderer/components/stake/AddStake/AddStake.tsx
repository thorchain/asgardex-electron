import React, { useCallback, useMemo, useState } from 'react'

import {
  Asset,
  AssetAmount,
  assetAmount as assetAmountFatory,
  assetToBase,
  BaseAmount,
  baseToAsset,
  PoolData
} from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { ZERO_ASSET_AMOUNT } from '../../../const'
import { isRuneAsset } from '../../../helpers/assetHelper'
import { AssetPair } from '../../../types/asgardex'
import Drag from '../../uielements/drag'
import * as Styled from './AddStake.style'

type Props = {
  asset: Asset
  runeAsset: Asset
  assetPrice: BigNumber
  runePrice: BigNumber
  assetBalance: BaseAmount
  runeBalance: BaseAmount
  unit?: string
  assetData?: AssetPair[]
  className?: string
  onStake: (stakeData: { asset: Asset; runeAsset: Asset; assetStake: BaseAmount; runeStake: BaseAmount }) => void
  onChangeAsset: (asset: Asset) => void
  disabled?: boolean
  poolData: PoolData
}

export const AddStake: React.FC<Props> = ({
  asset,
  runeAsset,
  assetPrice,
  runePrice,
  assetBalance,
  runeBalance,
  className,
  assetData,
  unit,
  onStake,
  onChangeAsset,
  disabled,
  poolData
}) => {
  const intl = useIntl()
  const [stakeRunes, setStakeRunes] = useState<AssetAmount>(ZERO_ASSET_AMOUNT)
  const [stakeAssets, setStakeAssets] = useState<AssetAmount>(ZERO_ASSET_AMOUNT)

  const runeSelect = useMemo(() => {
    return assetToBase(stakeRunes)
  }, [stakeRunes])

  const assetSelect = useMemo(() => {
    return assetToBase(stakeAssets)
  }, [stakeAssets])

  const getStakeValue = useCallback((amount: BigNumber, asset: Asset, poolData: PoolData) => {
    if (isRuneAsset(asset)) {
      return amount.times(poolData.assetBalance.amount().dividedBy(poolData.runeBalance.amount()))
    }
    return amount.times(poolData.runeBalance.amount().dividedBy(poolData.assetBalance.amount()))
  }, [])

  const onRuneChange = useCallback(
    (runeInput: BigNumber) => {
      const runeMax = baseToAsset(runeBalance).amount()
      const assetMax = baseToAsset(assetBalance).amount()

      const runeQuantity = runeInput.isGreaterThan(runeMax) ? runeMax : runeInput

      const assetQuantity = getStakeValue(runeQuantity, runeAsset, poolData)

      if (assetQuantity.isGreaterThan(assetMax)) {
        const runeInputQuantity = getStakeValue(assetMax, asset, poolData)
        setStakeRunes(assetAmountFatory(runeInputQuantity))
        setStakeAssets(assetAmountFatory(assetMax))
      } else {
        setStakeRunes(assetAmountFatory(runeInput))
        setStakeAssets(assetAmountFatory(assetQuantity))
      }
    },
    [runeBalance, assetBalance, getStakeValue, runeAsset, poolData, asset]
  )

  const onAssetChange = useCallback(
    (assetInput: BigNumber) => {
      const runeMax = baseToAsset(runeBalance).amount()
      const assetMax = baseToAsset(assetBalance).amount()

      const assetQuantity = assetInput.isGreaterThan(assetMax) ? assetMax : assetInput

      const runeQuantity = getStakeValue(assetQuantity, asset, poolData)

      if (runeQuantity.isGreaterThan(runeMax)) {
        const assetInputQuantity = getStakeValue(runeMax, runeAsset, poolData)
        setStakeRunes(assetAmountFatory(runeMax))
        setStakeAssets(assetAmountFatory(assetInputQuantity))
      } else {
        setStakeRunes(assetAmountFatory(runeQuantity))
        setStakeAssets(assetAmountFatory(assetQuantity))
      }
    },
    [runeBalance, assetBalance, getStakeValue, asset, poolData, runeAsset]
  )

  const onStakeConfirmed = useCallback(() => {
    onStake({
      asset,
      runeAsset,
      assetStake: assetSelect,
      runeStake: runeSelect
    })
  }, [onStake, asset, runeAsset, assetSelect, runeSelect])

  return (
    <Styled.Container className={className}>
      <Styled.InputsWrapper>
        <Styled.AssetCard
          disabled={disabled}
          asset={runeAsset}
          amount={runeBalance}
          selectedAmount={runeSelect}
          onChange={onRuneChange}
          price={runePrice}
          withPercentSlider
          unit={unit}
        />

        <Styled.AssetCard
          disabled={disabled}
          asset={asset}
          amount={assetBalance}
          selectedAmount={assetSelect}
          onChange={onAssetChange}
          price={assetPrice}
          assetData={assetData}
          unit={unit}
          onChangeAsset={onChangeAsset}
        />
      </Styled.InputsWrapper>

      <Drag
        title={intl.formatMessage({ id: 'stake.drag' })}
        source={runeAsset}
        target={asset}
        onConfirm={onStakeConfirmed}
        disabled={disabled || runeSelect.amount().isZero()}
      />
    </Styled.Container>
  )
}

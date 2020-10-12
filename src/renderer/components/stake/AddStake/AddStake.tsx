import React, { useCallback, useState } from 'react'

import { Asset, baseAmount, BaseAmount, PoolData } from '@thorchain/asgardex-util'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { ZERO_BASE_AMOUNT, ZERO_BN } from '../../../const'
import { isRuneAsset, THORCHAIN_DECIMAL } from '../../../helpers/assetHelper'
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
  assets?: Asset[]
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
  assets,
  unit,
  onStake,
  onChangeAsset,
  disabled = false,
  poolData
}) => {
  const intl = useIntl()
  const [runeAmountToStake, setRuneAmountToStake] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [assetAmountToStake, setAssetAmountToStake] = useState<BaseAmount>(ZERO_BASE_AMOUNT)

  const getStakeValue = useCallback((input: BaseAmount, asset: Asset, poolData: PoolData): BaseAmount => {
    let stakeValue = ZERO_BN
    if (isRuneAsset(asset)) {
      stakeValue = input.amount().times(poolData.assetBalance.amount().dividedBy(poolData.runeBalance.amount()))
    } else {
      stakeValue = input.amount().times(poolData.runeBalance.amount().dividedBy(poolData.assetBalance.amount()))
    }
    return baseAmount(stakeValue, THORCHAIN_DECIMAL)
  }, [])

  const runeAmountChangeHandler = useCallback(
    (runeInput: BaseAmount) => {
      const assetMax = assetBalance.amount()

      const runeQuantity = runeInput.amount().isGreaterThan(runeBalance.amount()) ? runeBalance : runeInput
      const assetQuantity = getStakeValue(runeQuantity, runeAsset, poolData)

      if (assetQuantity.amount().isGreaterThan(assetMax)) {
        const runeInputQuantity = getStakeValue(assetBalance, asset, poolData)
        setRuneAmountToStake(runeInputQuantity)
        setAssetAmountToStake(assetBalance)
      } else {
        setRuneAmountToStake(runeInput)
        setAssetAmountToStake(assetQuantity)
      }
    },
    [runeBalance, assetBalance, getStakeValue, runeAsset, poolData, asset]
  )

  const assetAmountChangeHandler = useCallback(
    (assetInput: BaseAmount) => {
      const runeMax = runeBalance.amount()
      const assetMax = assetBalance.amount()

      const assetQuantity = assetInput.amount().isGreaterThan(assetMax) ? assetBalance : assetInput
      const runeQuantity = getStakeValue(assetQuantity, asset, poolData)

      if (runeQuantity.amount().isGreaterThan(runeMax)) {
        const assetInputQuantity = getStakeValue(runeBalance, runeAsset, poolData)
        setRuneAmountToStake(runeBalance)
        setAssetAmountToStake(assetInputQuantity)
      } else {
        setRuneAmountToStake(runeQuantity)
        setAssetAmountToStake(assetQuantity)
      }
    },
    [runeBalance, assetBalance, getStakeValue, asset, poolData, runeAsset]
  )

  const onStakeConfirmed = useCallback(() => {
    onStake({
      asset,
      runeAsset,
      assetStake: assetAmountToStake,
      runeStake: runeAmountToStake
    })
  }, [onStake, asset, runeAsset, assetAmountToStake, runeAmountToStake])

  return (
    <Styled.Container className={className}>
      <Styled.InputsWrapper>
        <Styled.AssetCard
          disabled={disabled}
          asset={runeAsset}
          selectedAmount={runeAmountToStake}
          onChangeAssetAmount={runeAmountChangeHandler}
          price={runePrice}
          percentValue={0}
          unit={unit}
        />

        <Styled.AssetCard
          disabled={disabled}
          asset={asset}
          selectedAmount={assetAmountToStake}
          onChangeAssetAmount={assetAmountChangeHandler}
          price={assetPrice}
          assets={assets}
          unit={unit}
          onChangeAsset={onChangeAsset}
        />
      </Styled.InputsWrapper>

      <Drag
        title={intl.formatMessage({ id: 'stake.drag' })}
        source={runeAsset}
        target={asset}
        onConfirm={onStakeConfirmed}
        disabled={disabled || runeAmountToStake.amount().isZero()}
      />
    </Styled.Container>
  )
}

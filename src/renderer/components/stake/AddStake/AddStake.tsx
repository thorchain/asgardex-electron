import React, { useCallback, useMemo, useState } from 'react'

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
  priceAsset?: Asset
  assets?: Asset[]
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
  assets,
  priceAsset,
  onStake,
  onChangeAsset,
  disabled = false,
  poolData
}) => {
  const intl = useIntl()
  const [runeAmountToStake, setRuneAmountToStake] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [assetAmountToStake, setAssetAmountToStake] = useState<BaseAmount>(ZERO_BASE_AMOUNT)
  const [percentValueToStake, setPercentValueToStake] = useState(0)

  const maxRuneAmountToStake = useMemo((): BaseAmount => {
    const { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance } = poolData
    const maxRuneAmount = poolRuneBalance
      .amount()
      .dividedBy(poolAssetBalance.amount())
      .multipliedBy(assetBalance.amount())
    return maxRuneAmount.isGreaterThan(runeBalance.amount()) ? runeBalance : baseAmount(maxRuneAmount)
  }, [assetBalance, poolData, runeBalance])

  const maxAssetAmountToStake = useMemo((): BaseAmount => {
    const { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance } = poolData
    const maxAssetAmount = poolAssetBalance
      .amount()
      .dividedBy(poolRuneBalance.amount())
      .multipliedBy(runeBalance.amount())
    return maxAssetAmount.isGreaterThan(assetBalance.amount()) ? assetBalance : baseAmount(maxAssetAmount)
  }, [assetBalance, poolData, runeBalance])

  const getStakeValue = useCallback(
    (
      input: BaseAmount,
      asset: Asset,
      { runeBalance: poolRuneBalance, assetBalance: poolAssetBalance }: PoolData
    ): BaseAmount => {
      let stakeValue = ZERO_BN
      if (isRuneAsset(asset)) {
        stakeValue = input.amount().times(poolAssetBalance.amount().dividedBy(poolRuneBalance.amount()))
      } else {
        stakeValue = input.amount().times(poolRuneBalance.amount().dividedBy(poolAssetBalance.amount()))
      }
      return baseAmount(stakeValue, THORCHAIN_DECIMAL)
    },
    []
  )

  const runeAmountChangeHandler = useCallback(
    (runeInput: BaseAmount) => {
      const runeQuantity = runeInput.amount().isGreaterThan(maxRuneAmountToStake.amount())
        ? maxRuneAmountToStake
        : runeInput
      const assetQuantity = getStakeValue(runeQuantity, runeAsset, poolData)

      if (assetQuantity.amount().isGreaterThan(maxAssetAmountToStake.amount())) {
        const runeInputQuantity = getStakeValue(assetBalance, asset, poolData)
        setRuneAmountToStake(runeInputQuantity)
        setAssetAmountToStake(maxAssetAmountToStake)
        setPercentValueToStake(100)
      } else {
        setRuneAmountToStake(runeInput)
        setAssetAmountToStake(assetQuantity)
        // runeQuantity * 100 / maxRuneAmountToStake
        const percentToStake = maxRuneAmountToStake.amount().isGreaterThan(0)
          ? runeQuantity.amount().multipliedBy(100).dividedBy(maxRuneAmountToStake.amount()).toNumber()
          : 0
        setPercentValueToStake(percentToStake)
      }
    },
    [maxRuneAmountToStake, getStakeValue, runeAsset, poolData, maxAssetAmountToStake, assetBalance, asset]
  )

  const assetAmountChangeHandler = useCallback(
    (assetInput: BaseAmount) => {
      const assetMax = assetBalance.amount()

      const assetQuantity = assetInput.amount().isGreaterThan(assetMax) ? assetBalance : assetInput
      const runeQuantity = getStakeValue(assetQuantity, asset, poolData)

      if (runeQuantity.amount().isGreaterThan(maxRuneAmountToStake.amount())) {
        const assetInputQuantity = getStakeValue(runeBalance, runeAsset, poolData)
        setRuneAmountToStake(maxRuneAmountToStake)
        setAssetAmountToStake(assetInputQuantity)
        setPercentValueToStake(100)
      } else {
        setRuneAmountToStake(runeQuantity)
        setAssetAmountToStake(assetQuantity)
        // assetQuantity * 100 / maxAssetAmountToStake
        const percentToStake = maxAssetAmountToStake.amount().isGreaterThan(0)
          ? assetQuantity.amount().multipliedBy(100).dividedBy(maxAssetAmountToStake.amount()).toNumber()
          : 0
        setPercentValueToStake(percentToStake)
      }
    },
    [assetBalance, getStakeValue, asset, poolData, maxRuneAmountToStake, runeBalance, runeAsset, maxAssetAmountToStake]
  )

  const changePercentHandler = useCallback(
    (percent: number) => {
      console.log('percent', percent)
      const runeAmountBN = maxRuneAmountToStake.amount().dividedBy(100).multipliedBy(percent)
      const assetAmountBN = maxAssetAmountToStake.amount().dividedBy(100).multipliedBy(percent)
      setRuneAmountToStake(baseAmount(runeAmountBN))
      setAssetAmountToStake(baseAmount(assetAmountBN))
    },
    [maxAssetAmountToStake, maxRuneAmountToStake]
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
    <Styled.Container>
      <Styled.InputsWrapper>
        <Styled.AssetCard
          disabled={disabled}
          asset={runeAsset}
          selectedAmount={runeAmountToStake}
          maxAmount={maxRuneAmountToStake}
          onChangeAssetAmount={runeAmountChangeHandler}
          price={runePrice}
          percentValue={percentValueToStake}
          onChangePercent={changePercentHandler}
          priceAsset={priceAsset}
        />

        <Styled.AssetCard
          disabled={disabled}
          asset={asset}
          selectedAmount={assetAmountToStake}
          maxAmount={maxAssetAmountToStake}
          onChangeAssetAmount={assetAmountChangeHandler}
          price={assetPrice}
          assets={assets}
          priceAsset={priceAsset}
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

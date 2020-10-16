import React, { useCallback, useMemo, useState } from 'react'

import { Asset, baseAmount, BaseAmount, PoolData } from '@thorchain/asgardex-util'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import { useIntl } from 'react-intl'

import { ZERO_BASE_AMOUNT } from '../../../const'
import { StakeType } from '../../../types/asgardex'
import Drag from '../../uielements/drag'
import * as Helper from './AddStake.helper'
import * as Styled from './AddStake.style'

type Props = {
  type: StakeType
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

const AddStake: React.FC<Props> = ({
  type,
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

  const isAsym = useMemo(() => type === 'asym', [type])

  const maxRuneAmountToStake = useMemo(
    (): BaseAmount => Helper.maxRuneAmountToStake({ poolData, runeBalance, assetBalance }),
    [assetBalance, poolData, runeBalance]
  )

  const maxAssetAmountToStake = useMemo(
    (): BaseAmount => Helper.maxAssetAmountToStake({ poolData, runeBalance, assetBalance }),
    [assetBalance, poolData, runeBalance]
  )

  const runeAmountChangeHandler = useCallback(
    (runeInput: BaseAmount) => {
      let runeQuantity = runeInput.amount().isGreaterThan(maxRuneAmountToStake.amount())
        ? maxRuneAmountToStake
        : runeInput
      const assetQuantity = Helper.getAssetAmountToStake(runeQuantity, poolData)

      if (assetQuantity.amount().isGreaterThan(maxRuneAmountToStake.amount())) {
        runeQuantity = Helper.getRuneAmountToStake(maxRuneAmountToStake, poolData)
        setRuneAmountToStake(runeQuantity)
        setAssetAmountToStake(maxRuneAmountToStake)
        setPercentValueToStake(100)
      } else {
        setRuneAmountToStake(runeQuantity)
        setAssetAmountToStake(assetQuantity)
        // formula: runeQuantity * 100 / maxRuneAmountToStake
        const percentToStake = maxRuneAmountToStake.amount().isGreaterThan(0)
          ? runeQuantity.amount().multipliedBy(100).dividedBy(maxRuneAmountToStake.amount()).toNumber()
          : 0
        setPercentValueToStake(percentToStake)
      }
    },
    [maxRuneAmountToStake, poolData]
  )

  const assetAmountChangeHandler = useCallback(
    (assetInput: BaseAmount) => {
      let assetQuantity = assetInput.amount().isGreaterThan(maxRuneAmountToStake.amount())
        ? maxRuneAmountToStake
        : assetInput
      const runeQuantity = Helper.getRuneAmountToStake(assetQuantity, poolData)

      if (runeQuantity.amount().isGreaterThan(maxRuneAmountToStake.amount())) {
        assetQuantity = Helper.getAssetAmountToStake(runeQuantity, poolData)
        setRuneAmountToStake(maxRuneAmountToStake)
        setAssetAmountToStake(assetQuantity)
        setPercentValueToStake(100)
      } else {
        setRuneAmountToStake(runeQuantity)
        setAssetAmountToStake(assetQuantity)
        // assetQuantity * 100 / maxAssetAmountToStake
        const percentToStake = maxRuneAmountToStake.amount().isGreaterThan(0)
          ? assetQuantity.amount().multipliedBy(100).dividedBy(maxRuneAmountToStake.amount()).toNumber()
          : 0
        setPercentValueToStake(percentToStake)
      }
    },
    [maxRuneAmountToStake, poolData]
  )

  const changePercentHandler = useCallback(
    (percent: number) => {
      const runeAmountBN = maxRuneAmountToStake.amount().dividedBy(100).multipliedBy(percent)
      const assetAmountBN = maxAssetAmountToStake.amount().dividedBy(100).multipliedBy(percent)
      setRuneAmountToStake(baseAmount(runeAmountBN))
      setAssetAmountToStake(baseAmount(assetAmountBN))
      setPercentValueToStake(percent)
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
      <Styled.CardsRow gutter={{ lg: 32 }}>
        <Col xs={24} xl={12}>
          <Styled.AssetCard
            disabled={disabled}
            asset={asset}
            selectedAmount={assetAmountToStake}
            maxAmount={maxAssetAmountToStake}
            onChangeAssetAmount={assetAmountChangeHandler}
            price={assetPrice}
            assets={assets}
            percentValue={percentValueToStake}
            onChangePercent={changePercentHandler}
            onChangeAsset={onChangeAsset}
            priceAsset={priceAsset}
          />
        </Col>

        <Col xs={24} xl={12}>
          {isAsym && (
            <Styled.AssetCard
              disabled={disabled}
              asset={runeAsset}
              selectedAmount={runeAmountToStake}
              maxAmount={maxRuneAmountToStake}
              onChangeAssetAmount={runeAmountChangeHandler}
              price={runePrice}
              priceAsset={priceAsset}
            />
          )}
        </Col>
      </Styled.CardsRow>

      <Styled.DragWrapper>
        <Drag
          title={intl.formatMessage({ id: 'stake.drag' })}
          source={runeAsset}
          target={asset}
          onConfirm={onStakeConfirmed}
          disabled={disabled || runeAmountToStake.amount().isZero()}
        />
      </Styled.DragWrapper>
    </Styled.Container>
  )
}

export default AddStake

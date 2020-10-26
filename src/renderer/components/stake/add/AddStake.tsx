import React, { useCallback, useMemo, useState } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Asset, baseAmount, BaseAmount, PoolData } from '@thorchain/asgardex-util'
import { Col } from 'antd'
import BigNumber from 'bignumber.js'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'

import { BASE_CHAIN_ASSET, ZERO_BASE_AMOUNT } from '../../../const'
import { isBaseChainAsset } from '../../../helpers/chainHelper'
import { StakeFeesRD } from '../../../services/chain/types'
import { StakeType } from '../../../types/asgardex'
import { Drag } from '../../uielements/drag'
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
  fees: StakeFeesRD
  reloadFees: () => void
  assets?: Asset[]
  onStake: (stakeData: { asset: Asset; runeAsset: Asset; assetStake: BaseAmount; runeStake: BaseAmount }) => void
  onChangeAsset: (asset: Asset) => void
  disabled?: boolean
  poolData: PoolData
}

export const AddStake: React.FC<Props> = ({
  type,
  asset,
  runeAsset,
  assetPrice,
  runePrice,
  assetBalance,
  runeBalance,
  assets,
  priceAsset,
  reloadFees,
  fees,
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

  const hasCrossChainFee = useMemo(() => !isBaseChainAsset(asset), [asset])

  // TODO(@Veado) Needed for validation
  // issue: https://github.com/thorchain/asgardex-electron/issues/550
  const _baseChainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.toOption,
        O.map(({ base }) => base)
      ),
    [fees]
  )

  // TODO(@Veado) Needed for validation
  // issue: https://github.com/thorchain/asgardex-electron/issues/550
  const _poolChainFee: O.Option<BaseAmount> = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.toOption,
        O.chain(({ cross }) => cross)
      ),
    [fees]
  )

  const feesLabel = useMemo(
    () =>
      FP.pipe(
        fees,
        RD.fold(
          () => '...',
          () => '...',
          (error) => `${intl.formatMessage({ id: 'common.error' })} ${error?.message ?? ''}`,
          ({ base, cross }) =>
            // Show one or two fees
            `${Helper.formatFee(base, BASE_CHAIN_ASSET)} ${FP.pipe(
              cross,
              O.map((crossFee) => ` + ${Helper.formatFee(crossFee, asset)}`),
              O.getOrElse(() => '')
            )}`
        )
      ),
    [asset, fees, intl]
  )

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
          <Styled.FeeRow>
            <Col>
              <Styled.ReloadFeeButton onClick={reloadFees} disabled={RD.isPending(fees)}>
                <SyncOutlined />
              </Styled.ReloadFeeButton>
            </Col>
            <Col>
              <Styled.FeeLabel disabled={RD.isPending(fees)}>
                {hasCrossChainFee
                  ? intl.formatMessage({ id: 'common.fees' })
                  : intl.formatMessage({ id: 'common.fee' })}
                : {feesLabel}
              </Styled.FeeLabel>
            </Col>
          </Styled.FeeRow>
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

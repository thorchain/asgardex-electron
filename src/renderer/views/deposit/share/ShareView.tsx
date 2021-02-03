import React, { useCallback, useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { getValueOfAsset1InAsset2, getValueOfRuneInAsset } from '@thorchain/asgardex-util'
import { Asset, AssetRuneNative, baseAmount, bnOrZero } from '@xchainjs/xchain-util'
import { Spin } from 'antd'
import * as O from 'fp-ts/lib/Option'
import * as FP from 'fp-ts/pipeable'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'

import { PoolShare } from '../../../components/uielements/poolShare'
import { useChainContext } from '../../../contexts/ChainContext'
import { useMidgardContext } from '../../../contexts/MidgardContext'
import { RUNE_PRICE_POOL } from '../../../helpers/poolHelper'
import * as shareHelpers from '../../../helpers/poolShareHelper'
import {
  PoolDetailRD,
  StakersAssetData,
  StakersAssetDataRD,
  PoolDetail,
  StakersAssetDataLD
} from '../../../services/midgard/types'
import { toPoolData } from '../../../services/midgard/utils'
import * as Styled from './ShareView.styles'

export const ShareView: React.FC<{ asset: Asset }> = ({ asset }) => {
  const { service: midgardService } = useMidgardContext()
  const {
    pools: { poolDetail$, selectedPricePoolAsset$, selectedPricePool$ },
    stake: { getStakes$ }
  } = midgardService

  const intl = useIntl()

  const { addressByChain$ } = useChainContext()

  const address$ = useMemo(() => addressByChain$(asset.chain), [addressByChain$, asset.chain])
  const oAssetWalletAddress = useObservableState(address$, O.none)

  /**
   * We have to get a new stake-stream for every new asset
   * @description /src/renderer/services/midgard/stake.ts
   */
  const depositData$: StakersAssetDataLD = useMemo(
    () =>
      FP.pipe(
        oAssetWalletAddress,
        O.fold(
          () => Rx.EMPTY,
          (address) => getStakes$(asset, address)
        )
      ),
    [asset, getStakes$, oAssetWalletAddress]
  )
  const depositData = useObservableState<StakersAssetDataRD>(depositData$, RD.initial)

  const poolDetailRD = useObservableState<PoolDetailRD>(poolDetail$, RD.initial)
  const oPriceAsset = useObservableState<O.Option<Asset>>(selectedPricePoolAsset$, O.none)

  const { poolData: pricePoolData } = useObservableState(selectedPricePool$, RUNE_PRICE_POOL)

  const renderPoolShareReady = useCallback(
    (stake: StakersAssetData, poolDetail: PoolDetail) => {
      const runeShare = shareHelpers.getRuneShare(stake, poolDetail)
      const assetShare = shareHelpers.getAssetShare(stake, poolDetail)
      const poolShare = shareHelpers.getPoolShare(stake, poolDetail)
      // stake units are RUNE based, provided as `BaseAmount`
      const stakeUnits = baseAmount(bnOrZero(stake.units))

      const poolData = toPoolData(poolDetail)

      const assetDepositPrice = getValueOfAsset1InAsset2(assetShare, poolData, pricePoolData)
      const runeDepositPrice = getValueOfRuneInAsset(runeShare, pricePoolData)

      return (
        <PoolShare
          sourceAsset={AssetRuneNative}
          targetAsset={asset}
          poolShare={poolShare}
          depositUnits={stakeUnits}
          assetDepositShare={assetShare}
          priceAsset={FP.pipe(oPriceAsset, O.toUndefined)}
          loading={false}
          assetDepositPrice={assetDepositPrice}
          runeDepositPrice={runeDepositPrice}
          runeDepositShare={runeShare}
        />
      )
    },
    [asset, oPriceAsset, pricePoolData]
  )

  const renderNoShare = useMemo(
    () => <Styled.EmptyData description={intl.formatMessage({ id: 'deposit.pool.noDeposit' })} />,
    [intl]
  )

  const renderPoolShare = useMemo(
    () =>
      FP.pipe(
        RD.combine(depositData, poolDetailRD),
        RD.fold(
          () => renderNoShare,
          () => <Spin />,
          () => renderNoShare,
          ([stake, pool]) => renderPoolShareReady(stake, pool)
        )
      ),

    [poolDetailRD, renderPoolShareReady, depositData, renderNoShare]
  )

  return renderPoolShare
}

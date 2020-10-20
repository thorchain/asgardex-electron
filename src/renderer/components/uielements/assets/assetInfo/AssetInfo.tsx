import React, { useMemo, useRef } from 'react'

import { Asset, formatAssetAmount, assetToString, AssetAmount } from '@thorchain/asgardex-util'
import { Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { loadingString } from '../../../../helpers/stringHelper'
import { getAssetAmountByAsset } from '../../../../helpers/walletHelper'
import { NonEmptyAssetsWithBalance } from '../../../../services/wallet/types'
import { AssetIcon } from '../assetIcon'
import * as Styled from './AssetInfo.style'

type Props = {
  asset: O.Option<Asset>
  // balances are optional:
  // No balances == don't render price
  // balances == render price
  assetsWB?: O.Option<NonEmptyAssetsWithBalance>
}

export const AssetInfo: React.FC<Props> = (props): JSX.Element => {
  const { assetsWB = O.none, asset: oAsset } = props

  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  const previousBalance = useRef<O.Option<AssetAmount>>(O.none)

  const renderAssetIcon = useMemo(
    () =>
      FP.pipe(
        oAsset,
        O.map((asset) => <AssetIcon asset={asset} size="large" key={assetToString(asset)} />),
        O.getOrElse(() => <></>)
      ),
    [oAsset]
  )

  const renderBalance = useMemo(
    () =>
      FP.pipe(
        sequenceTOption(assetsWB, oAsset),
        O.fold(
          () =>
            FP.pipe(
              previousBalance.current,
              O.map((amount) => formatAssetAmount({ amount, trimZeros: true })),
              O.getOrElse(() => loadingString)
            ),
          ([assetsWB, asset]) =>
            FP.pipe(
              getAssetAmountByAsset(assetsWB, asset),
              // save latest amount (if available only)
              O.map((amount) => {
                previousBalance.current = O.some(amount)
                return amount
              }),
              // use previous stored balances if amount is not available,
              // because `assetsWB` is loaded in parallel for all assets of different chains
              O.alt(() => previousBalance.current),
              O.map((amount) => formatAssetAmount({ amount, trimZeros: true })),
              O.getOrElse(() => loadingString)
            )
        )
      ),
    [oAsset, assetsWB]
  )

  return (
    <Styled.Card bordered={false} bodyStyle={{ display: 'flex', flexDirection: 'row' }}>
      {renderAssetIcon}
      <Styled.CoinInfoWrapper>
        <Styled.CoinTitle>
          {FP.pipe(
            oAsset,
            O.map(({ ticker }) => ticker),
            O.getOrElse(() => loadingString)
          )}
        </Styled.CoinTitle>
        <Styled.CoinSubtitle>
          {FP.pipe(
            oAsset,
            O.map(assetToString),
            O.getOrElse(() => loadingString)
          )}
        </Styled.CoinSubtitle>
        {!isDesktopView && <Styled.CoinMobilePrice>{renderBalance}</Styled.CoinMobilePrice>}
      </Styled.CoinInfoWrapper>
      {isDesktopView && <Styled.CoinPrice>{renderBalance}</Styled.CoinPrice>}
    </Styled.Card>
  )
}

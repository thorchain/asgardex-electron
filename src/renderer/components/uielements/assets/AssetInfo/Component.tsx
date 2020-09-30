import React, { useMemo, useRef } from 'react'

import { Asset, formatAssetAmount, assetToString } from '@thorchain/asgardex-util'
import { Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { trimZeros } from '../../../../helpers/stringHelper'
import { getAssetAmountByAsset } from '../../../../helpers/walletHelper'
import { NonEmptyAssetsWithBalance } from '../../../../services/wallet/types'
import AssetIcon from '../assetIcon'
import * as Styled from './Component.style'

type Props = {
  asset: O.Option<Asset>
  // balances are optional:
  // No balances == don't render price
  // balances == render price
  assetsWB?: O.Option<NonEmptyAssetsWithBalance>
}

const Component: React.FC<Props> = (props): JSX.Element => {
  const { assetsWB = O.none, asset: oAsset } = props

  const asset = O.toNullable(oAsset)
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // TODO (@Veado): Improve caching of previous loaded data
  // https://github.com/thorchain/asgardex-electron/issues/286
  const previousBalance = useRef<string>('--')

  const renderAssetIcon = useMemo(() => asset && <AssetIcon asset={asset} size="large" />, [asset])

  const renderBalance = useMemo(() => {
    if (O.isNone(assetsWB)) return React.Fragment

    return FP.pipe(
      sequenceTOption(assetsWB, oAsset),
      O.fold(
        () => previousBalance.current,
        ([assetsWB, asset]) => {
          const amount = getAssetAmountByAsset(assetsWB, asset)
          const balance = trimZeros(formatAssetAmount(amount, amount.decimal))
          previousBalance.current = balance
          return balance
        }
      )
    )
  }, [oAsset, assetsWB])

  return (
    <Styled.Card bordered={false} bodyStyle={{ display: 'flex', flexDirection: 'row' }}>
      {renderAssetIcon}
      <Styled.CoinInfoWrapper>
        <Styled.CoinTitle>{asset?.ticker ?? '--'}</Styled.CoinTitle>
        <Styled.CoinSubtitle>{asset ? assetToString(asset) : '--'}</Styled.CoinSubtitle>
        {!isDesktopView && <Styled.CoinMobilePrice>{renderBalance}</Styled.CoinMobilePrice>}
      </Styled.CoinInfoWrapper>
      {isDesktopView && <Styled.CoinPrice>{renderBalance}</Styled.CoinPrice>}
    </Styled.Card>
  )
}

export default Component

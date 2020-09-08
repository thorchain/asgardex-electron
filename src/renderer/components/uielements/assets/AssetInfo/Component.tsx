import React, { useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, formatAssetAmount, assetToString } from '@thorchain/asgardex-util'
import { Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { sequenceTOption } from '../../../../helpers/fpHelpers'
import { getAssetAmountByAsset } from '../../../../helpers/walletHelper'
import { AssetsWithBalanceRD } from '../../../../services/wallet/types'
import AssetIcon from '../assetIcon'
import * as Styled from './Component.style'

type Props = {
  asset: O.Option<Asset>
  // balances are optional:
  // No balances == don't render price
  // balances == render price
  assetsRD?: AssetsWithBalanceRD
}

const Component: React.FC<Props> = (props: Props): JSX.Element => {
  const { assetsRD, asset: oAsset } = props

  const asset = O.toNullable(oAsset)
  const isDesktopView = Grid.useBreakpoint()?.lg ?? false

  // TODO (@Veado): Improve caching of previous loaded data
  // https://github.com/thorchain/asgardex-electron/issues/286
  const previousBalance = useRef<string>('--')

  const renderAssetIcon = useMemo(() => asset && <AssetIcon asset={asset} size="large" />, [asset])

  const renderBalance = useMemo(() => {
    if (!assetsRD) return React.Fragment

    return FP.pipe(
      assetsRD,
      RD.toOption,
      (oAssetsWB) => sequenceTOption(oAssetsWB, oAsset),
      O.fold(
        () => previousBalance.current,
        ([assetsWB, asset]) => {
          const amount = getAssetAmountByAsset(assetsWB, asset)
          const balance = formatAssetAmount(amount, 3)
          previousBalance.current = balance
          return balance
        }
      )
    )
  }, [oAsset, assetsRD])

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

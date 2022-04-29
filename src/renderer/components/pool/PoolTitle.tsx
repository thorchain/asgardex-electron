import React, { useMemo } from 'react'

import { SwapOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetAmount, AssetRuneNative, assetToString, formatAssetAmount } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Network } from '../../../shared/api/types'
import { loadingString } from '../../helpers/stringHelper'
import * as poolsRoutes from '../../routes/pools'
import { ManageButton } from '../manageButton'
import { AssetIcon } from '../uielements/assets/assetIcon'
import { Button } from '../uielements/button'
import * as Styled from './PoolTitle.styles'

export type Props = {
  asset: Asset
  price: RD.RemoteData<Error, { amount: AssetAmount; symbol: string }>
  isLoading?: boolean
  disableTradingPoolAction: boolean
  disableAllPoolActions: boolean
  disablePoolActions: boolean
  network: Network
  isAvailablePool: boolean
}

export const PoolTitle: React.FC<Props> = ({
  asset,
  price: priceRD,
  disableTradingPoolAction,
  disableAllPoolActions,
  disablePoolActions,
  network,
  isAvailablePool
}) => {
  const navigate = useNavigate()
  const intl = useIntl()
  const isDesktopView = Grid.useBreakpoint()?.md ?? false

  const title = useMemo(
    () => (
      <>
        <AssetIcon asset={asset} size={isDesktopView ? 'big' : 'normal'} key={assetToString(asset)} network={network} />
        <Styled.AssetWrapper>
          <Styled.AssetTitle>{asset.ticker}</Styled.AssetTitle>
          <Styled.AssetSubtitle>{asset.chain}</Styled.AssetSubtitle>
        </Styled.AssetWrapper>
      </>
    ),
    [asset, isDesktopView, network]
  )

  const priceStr = useMemo(
    () =>
      FP.pipe(
        priceRD,
        RD.map(({ amount, symbol }) => `${symbol} ${formatAssetAmount({ amount, decimal: 3 })}`),
        RD.getOrElse(() => loadingString)
      ),
    [priceRD]
  )

  const buttons = useMemo(
    () => (
      <Styled.ButtonActions>
        <ManageButton
          disabled={disableAllPoolActions || disablePoolActions}
          asset={asset}
          sizevalue={isDesktopView ? 'normal' : 'small'}
          isTextView={isDesktopView}
        />
        {isAvailablePool && (
          <Button
            disabled={disableAllPoolActions || disableTradingPoolAction}
            round="true"
            sizevalue={isDesktopView ? 'normal' : 'small'}
            style={{ height: 30 }}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              navigate(
                poolsRoutes.swap.path({
                  source: assetToString(asset),
                  target: assetToString(AssetRuneNative)
                })
              )
            }}>
            <SwapOutlined />
            {isDesktopView && intl.formatMessage({ id: 'common.swap' })}
          </Button>
        )}
      </Styled.ButtonActions>
    ),
    [
      disableAllPoolActions,
      disablePoolActions,
      asset,
      isDesktopView,
      isAvailablePool,
      disableTradingPoolAction,
      intl,
      navigate
    ]
  )

  return (
    <Styled.Container>
      <Styled.RowItem>
        <Styled.TitleContainer>{title}</Styled.TitleContainer>
        <Styled.Price>{priceStr}</Styled.Price>
      </Styled.RowItem>
      <Styled.RowItem>{buttons}</Styled.RowItem>
    </Styled.Container>
  )
}

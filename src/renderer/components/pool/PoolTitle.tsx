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
import { FlatButton } from '../uielements/button'
import * as Styled from './PoolTitle.styles'

export type Props = {
  asset: Asset
  watched: boolean
  watch: FP.Lazy<void>
  unwatch: FP.Lazy<void>
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
  watched,
  watch,
  unwatch,
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

  const title = useMemo(() => {
    const Star = watched ? Styled.StarFilled : Styled.StarOutlined
    const starClickHandler = watched ? unwatch : watch
    return (
      <>
        <AssetIcon asset={asset} size={isDesktopView ? 'big' : 'normal'} key={assetToString(asset)} network={network} />
        <Styled.AssetWrapper>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Styled.AssetTitle>{asset.ticker}</Styled.AssetTitle>
            <Star onClick={starClickHandler} />
          </div>
          <Styled.AssetSubtitle>{asset.chain}</Styled.AssetSubtitle>
        </Styled.AssetWrapper>
      </>
    )
  }, [asset, isDesktopView, network, unwatch, watch, watched])

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
          size="normal"
          isTextView={isDesktopView}
        />
        {isAvailablePool && (
          <FlatButton
            disabled={disableAllPoolActions || disableTradingPoolAction}
            size="normal"
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
            <SwapOutlined className="md:mr-[8px]" />
            {isDesktopView && intl.formatMessage({ id: 'common.swap' })}
          </FlatButton>
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

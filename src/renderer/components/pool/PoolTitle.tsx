import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Asset, AssetAmount, assetToString, formatAssetAmount } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { Network } from '../../../shared/api/types'
import { AssetRuneNative } from '../../../shared/utils/asset'
import { Action as ActionButtonAction, ActionButton } from '../../components/uielements/button/ActionButton'
import { DEFAULT_WALLET_TYPE } from '../../const'
import { loadingString } from '../../helpers/stringHelper'
import * as poolsRoutes from '../../routes/pools'
// import * as saversRoutes from '../../routes/pools/savers'
import { AssetIcon } from '../uielements/assets/assetIcon'
import * as Styled from './PoolTitle.styles'

export type Props = {
  asset: Asset
  watched: boolean
  watch: FP.Lazy<void>
  unwatch: FP.Lazy<void>
  price: RD.RemoteData<Error, { amount: AssetAmount; symbol: string }>
  network: Network
  isAvailablePool: boolean
}

export const PoolTitle: React.FC<Props> = ({
  asset,
  watched,
  watch,
  unwatch,
  price: priceRD,
  network,
  isAvailablePool
}) => {
  const isDesktopView = Grid.useBreakpoint()?.md ?? false

  const intl = useIntl()
  const navigate = useNavigate()

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

  const actionButton = useMemo(() => {
    const actions: ActionButtonAction[] = [
      {
        label: intl.formatMessage({ id: 'common.swap' }),
        disabled: !isAvailablePool,
        callback: () => {
          navigate(
            poolsRoutes.swap.path({
              source: assetToString(AssetRuneNative),
              target: assetToString(asset),
              sourceWalletType: DEFAULT_WALLET_TYPE,
              targetWalletType: DEFAULT_WALLET_TYPE
            })
          )
        }
      },
      {
        label: intl.formatMessage({ id: 'common.manage' }),
        callback: () => {
          navigate(
            poolsRoutes.deposit.path({
              asset: assetToString(asset),
              assetWalletType: DEFAULT_WALLET_TYPE,
              runeWalletType: DEFAULT_WALLET_TYPE
            })
          )
        }
      }
      // TODO(@veado) Enable savers
      // {
      //   label: intl.formatMessage({ id: 'common.savers' }),
      //   disabled: !isAvailablePool || disableAllPoolActions || disableTradingPoolAction,
      //   callback: () => {
      //     navigate(saversRoutes.earn.path({ asset: assetToString(asset), walletType: DEFAULT_WALLET_TYPE }))
      //   }
      // }
    ]

    return <ActionButton size={isDesktopView ? 'large' : 'normal'} actions={actions} />
  }, [intl, isAvailablePool, isDesktopView, navigate, asset])

  return (
    <Styled.Container>
      <Styled.RowItem>
        <Styled.TitleContainer>{title}</Styled.TitleContainer>
        <Styled.Price>{priceStr}</Styled.Price>
      </Styled.RowItem>
      <Styled.RowItem>{actionButton}</Styled.RowItem>
    </Styled.Container>
  )
}

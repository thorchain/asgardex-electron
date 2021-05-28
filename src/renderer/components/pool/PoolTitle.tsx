import React, { useMemo } from 'react'

import { SwapOutlined } from '@ant-design/icons'
import { AssetRune } from '@xchainjs/xchain-thorchain'
import { Asset, AssetAmount, assetToString, Chain, formatAssetAmount } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { Network } from '../../../shared/api/types'
import * as PoolHelpers from '../../helpers/poolHelper'
import { loadingString } from '../../helpers/stringHelper'
import * as poolsRoutes from '../../routes/pools'
import { ManageButton } from '../manageButton'
import { AssetIcon } from '../uielements/assets/assetIcon'
import { Button } from '../uielements/button'
import * as Styled from './PoolTitle.style'

export type Props = {
  asset: O.Option<Asset>
  price: AssetAmount
  priceSymbol?: string
  isLoading?: boolean
  haltedChains?: Chain[]
  network: Network
}

export const PoolTitle: React.FC<Props> = ({
  asset: oAsset,
  price,
  priceSymbol,
  haltedChains = [],
  network,
  isLoading
}) => {
  const history = useHistory()
  const intl = useIntl()
  const isDesktopView = Grid.useBreakpoint()?.md ?? false

  const title = useMemo(
    () =>
      FP.pipe(
        oAsset,
        O.fold(
          () => <>--</>,
          (asset) => (
            <>
              <AssetIcon
                asset={asset}
                size={isDesktopView ? 'big' : 'normal'}
                key={assetToString(asset)}
                network={network}
              />

              <Styled.AssetWrapper>
                <Styled.AssetTitle>
                  {FP.pipe(
                    oAsset,
                    O.map(({ ticker }) => ticker),
                    O.getOrElse(() => loadingString)
                  )}
                </Styled.AssetTitle>
                <Styled.AssetSubtitle>
                  {FP.pipe(
                    oAsset,
                    O.map((asset) => asset.chain),
                    O.getOrElse(() => loadingString)
                  )}
                </Styled.AssetSubtitle>
              </Styled.AssetWrapper>
            </>
          )
        )
      ),
    [oAsset, isDesktopView, network]
  )

  const disableButton = useMemo(
    () =>
      FP.pipe(
        oAsset,
        O.map(({ chain }) => chain),
        O.map(PoolHelpers.isChainHalted(haltedChains)),
        O.getOrElse(() => true)
      ),
    [haltedChains, oAsset]
  )

  const priceStr = useMemo(() => {
    if (isLoading) return loadingString

    return FP.pipe(
      oAsset,
      O.fold(
        () => '',
        () => `${priceSymbol} ${formatAssetAmount({ amount: price, decimal: 3 })}`
      )
    )
  }, [isLoading, oAsset, price, priceSymbol])

  const buttons = useMemo(
    () =>
      FP.pipe(
        oAsset,
        O.fold(
          () => <></>,
          (asset) => {
            return (
              <Styled.ButtonActions>
                <ManageButton
                  disabled={disableButton}
                  asset={asset}
                  sizevalue={isDesktopView ? 'normal' : 'small'}
                  isTextView={isDesktopView}
                />
                <Button
                  disabled={disableButton}
                  round="true"
                  sizevalue={isDesktopView ? 'normal' : 'small'}
                  style={{ height: 30 }}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    history.push(
                      poolsRoutes.swap.path({ source: assetToString(asset), target: assetToString(AssetRune) })
                    )
                  }}>
                  <SwapOutlined />
                  {isDesktopView && intl.formatMessage({ id: 'common.swap' })}
                </Button>
              </Styled.ButtonActions>
            )
          }
        )
      ),
    [history, intl, isDesktopView, oAsset, disableButton]
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

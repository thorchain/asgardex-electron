import React, { useMemo } from 'react'

import { SwapOutlined } from '@ant-design/icons'
import { AssetRune } from '@xchainjs/xchain-thorchain'
import { Asset, AssetAmount, assetToString, formatAssetAmountCurrency } from '@xchainjs/xchain-util'
import { Grid } from 'antd'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import * as poolsRoutes from '../../routes/pools'
import { ManageButton } from '../manageButton'
import { Button } from '../uielements/button'
import * as Styled from './PoolTitle.style'

export type Props = {
  asset: O.Option<Asset>
  priceUSD: AssetAmount
  isLoading?: boolean
}

export const PoolTitle: React.FC<Props> = ({ asset: oAsset, priceUSD }) => {
  const history = useHistory()
  const intl = useIntl()
  const isDesktopView = Grid.useBreakpoint()?.md ?? false

  const title = useMemo(
    () =>
      FP.pipe(
        oAsset,
        O.fold(
          () => '--',
          (asset) => `${asset.chain}.${asset.ticker}`
        )
      ),
    [oAsset]
  )

  const price = useMemo(
    () =>
      FP.pipe(
        oAsset,
        O.fold(
          () => '',
          () =>
            formatAssetAmountCurrency({
              amount: priceUSD,
              decimal: 3
            })
        )
      ),
    [oAsset, priceUSD]
  )

  const buttons = useMemo(
    () =>
      FP.pipe(
        oAsset,
        O.fold(
          () => <></>,
          (asset) => {
            return (
              <Styled.ButtonActions>
                <ManageButton asset={asset} sizevalue={isDesktopView ? 'normal' : 'small'} isTextView={isDesktopView} />
                <Button
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
    [history, intl, isDesktopView, oAsset]
  )

  return (
    <Styled.Container>
      <Styled.RowItem>
        <Styled.Title>{title}</Styled.Title>
        <Styled.Price>{price}</Styled.Price>
      </Styled.RowItem>
      <Styled.RowItem>{buttons}</Styled.RowItem>
    </Styled.Container>
  )
}

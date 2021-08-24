import React, { useMemo, useCallback } from 'react'

import { assetFromString, assetToString } from '@xchainjs/xchain-util'
import { Row, Dropdown } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'

import { ReactComponent as DownIcon } from '../../../assets/svg/icon-down.svg'
import { SelectedPricePoolAsset } from '../../../services/midgard/types'
import { PricePoolAsset, PricePoolAssets } from '../../../views/pools/Pools.types'
import { Menu } from '../../shared/menu/Menu'
import { toHeaderCurrencyLabel } from '../Header.util'
import {
  HeaderDropdownMenuItem,
  HeaderDropdownContentWrapper,
  HeaderDropdownMenuItemText,
  HeaderDropdownTitle
} from '../HeaderMenu.styles'
import * as Styled from './HeaderPriceSelector.styles'

type Props = {
  isDesktopView: boolean
  assets: PricePoolAssets
  disabled?: boolean
  selectedAsset: SelectedPricePoolAsset
  changeHandler?: (asset: PricePoolAsset) => void
}

export const HeaderPriceSelector: React.FC<Props> = (props): JSX.Element => {
  const { assets, selectedAsset, isDesktopView, disabled = false, changeHandler = (_) => {} } = props

  const changeItem: MenuProps['onClick'] = useCallback(
    (param) => FP.pipe(param.key, assetFromString, O.fromNullable, O.map(changeHandler)),
    [changeHandler]
  )

  const menu = useMemo(
    () => (
      <Menu onClick={changeItem}>
        {assets.map((asset) => {
          return (
            <HeaderDropdownMenuItem key={assetToString(asset)}>
              <HeaderDropdownMenuItemText strong>{toHeaderCurrencyLabel(asset)}</HeaderDropdownMenuItemText>
            </HeaderDropdownMenuItem>
          )
        })}
      </Menu>
    ),
    [changeItem, assets]
  )

  const title = useMemo(
    () =>
      FP.pipe(
        selectedAsset,
        O.fold(() => '--', toHeaderCurrencyLabel)
      ),
    [selectedAsset]
  )

  return (
    <Styled.Wrapper>
      <Dropdown disabled={disabled} overlay={menu} trigger={['click']} placement="bottomCenter">
        <HeaderDropdownContentWrapper>
          {!isDesktopView && <HeaderDropdownTitle>Currency</HeaderDropdownTitle>}
          <Row style={{ alignItems: 'center' }}>
            <HeaderDropdownMenuItemText strong>{title}</HeaderDropdownMenuItemText>
            <DownIcon />
          </Row>
        </HeaderDropdownContentWrapper>
      </Dropdown>
    </Styled.Wrapper>
  )
}

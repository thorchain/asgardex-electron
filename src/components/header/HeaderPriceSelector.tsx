import React, { useMemo, useCallback } from 'react'

import { Row, Dropdown } from 'antd'
import { ClickParam } from 'antd/lib/menu'

import { ReactComponent as DownIcon } from '../../assets/svg/icon-down.svg'
import { PricePoolAsset, PricePoolAssets } from '../../views/pools/types'
import Menu from '../shared/Menu'
import {
  HeaderDropdownMenuItem,
  HeaderDropdownContentWrapper,
  HeaderDropdownMenuItemText,
  HeaderDropdownTitle
} from './HeaderMenu.style'
import { HeaderPriceSelectorWrapper } from './HeaderPriceSelector.style'
import { toHeaderCurrencyLabel } from './util'

type Props = {
  isDesktopView: boolean
  assets: PricePoolAssets
  disabled?: boolean
  selectedAsset?: PricePoolAsset
  changeHandler?: (asset: PricePoolAsset) => void
}

const HeaderPriceSelector: React.FC<Props> = (props: Props): JSX.Element => {
  const { assets, selectedAsset, isDesktopView, disabled = false, changeHandler = (_) => {} } = props

  const changeItem = useCallback(
    (param: ClickParam) => {
      const asset = param.key as PricePoolAsset
      changeHandler(asset)
    },
    [changeHandler]
  )

  const menu = useMemo(
    () => (
      <Menu onClick={changeItem}>
        {assets.map((asset) => {
          return (
            <HeaderDropdownMenuItem key={asset}>
              <HeaderDropdownMenuItemText strong>{toHeaderCurrencyLabel(asset)}</HeaderDropdownMenuItemText>
            </HeaderDropdownMenuItem>
          )
        })}
      </Menu>
    ),
    [changeItem, assets]
  )

  const title = useMemo(() => (selectedAsset ? toHeaderCurrencyLabel(selectedAsset) : '--'), [selectedAsset])
  return (
    <HeaderPriceSelectorWrapper>
      <Dropdown disabled={disabled} overlay={menu} trigger={['click']} placement="bottomCenter">
        <HeaderDropdownContentWrapper>
          {!isDesktopView && <HeaderDropdownTitle>Currency</HeaderDropdownTitle>}
          <Row style={{ alignItems: 'center' }}>
            <HeaderDropdownMenuItemText strong>{title}</HeaderDropdownMenuItemText>
            <DownIcon />
          </Row>
        </HeaderDropdownContentWrapper>
      </Dropdown>
    </HeaderPriceSelectorWrapper>
  )
}

export default HeaderPriceSelector

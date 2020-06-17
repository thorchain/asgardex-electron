import React, { useMemo, useCallback } from 'react'

import { Row, Dropdown } from 'antd'
import { ClickParam } from 'antd/lib/menu'

import { ReactComponent as DownIcon } from '../../assets/svg/icon-down.svg'
import { PricePool, PricePools, PricePoolAsset } from '../../views/pools/types'
import Menu from '../shared/Menu'
import {
  HeaderDropdownMenuItem,
  HeaderDropdownContentWrapper,
  HeaderDropdownMenuItemText,
  HeaderDropdownWrapper,
  HeaderDropdownTitle
} from './HeaderMenu.style'
import { toHeaderCurrencyLabel } from './util'

type Props = {
  isDesktopView: boolean
  pools: PricePools
  disabled?: boolean
  selectedPool?: PricePool
  changeHandler?: (asset: PricePoolAsset) => void
}

const HeaderCurrency: React.FC<Props> = (props: Props): JSX.Element => {
  const { pools, selectedPool, isDesktopView, disabled = false, changeHandler = (_) => {} } = props

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
        {pools.map(({ asset }) => {
          return (
            <HeaderDropdownMenuItem key={asset}>
              <HeaderDropdownMenuItemText strong>{toHeaderCurrencyLabel(asset)}</HeaderDropdownMenuItemText>
            </HeaderDropdownMenuItem>
          )
        })}
      </Menu>
    ),
    [changeItem, pools]
  )

  const title = useMemo(() => (selectedPool ? toHeaderCurrencyLabel(selectedPool.asset) : '--'), [selectedPool])
  return (
    <HeaderDropdownWrapper>
      <Dropdown disabled={disabled} overlay={menu} trigger={['click']} placement="bottomCenter">
        <HeaderDropdownContentWrapper>
          {!isDesktopView && <HeaderDropdownTitle>Currency</HeaderDropdownTitle>}
          <Row style={{ alignItems: 'center' }}>
            <HeaderDropdownMenuItemText strong>{title}</HeaderDropdownMenuItemText>
            <DownIcon />
          </Row>
        </HeaderDropdownContentWrapper>
      </Dropdown>
    </HeaderDropdownWrapper>
  )
}

export default HeaderCurrency

import React, { useMemo, useCallback } from 'react'

import { Row, Dropdown } from 'antd'
import { ClickParam } from 'antd/lib/menu'

import { ReactComponent as DownIcon } from '../../assets/svg/icon-down.svg'
import Menu from '../shared/Menu'
import {
  HeaderDropdownMenuItem,
  HeaderDropdownContentWrapper,
  HeaderDropdownMenuItemText,
  HeaderDropdownWrapper,
  HeaderDropdownTitle
} from './HeaderMenu.style'

export type HeaderCurrencyItem = {
  label: string
  value: string
}

export type HeaderCurrencyItems = HeaderCurrencyItem[]

type Props = {
  isDesktopView: boolean
  items: HeaderCurrencyItems
  disabled?: boolean
  selectedItem?: HeaderCurrencyItem
  changeHandler?: (value: string) => void
}

const HeaderCurrency: React.FC<Props> = (props: Props): JSX.Element => {
  const { items, selectedItem, isDesktopView, disabled = false, changeHandler = (_) => {} } = props

  const changeItem = useCallback(
    ({ key }: ClickParam) => {
      changeHandler(key)
    },
    [changeHandler]
  )

  const menu = useMemo(
    () => (
      <Menu onClick={changeItem}>
        {items.map(({ label, value }: HeaderCurrencyItem) => {
          return (
            <HeaderDropdownMenuItem key={value}>
              <HeaderDropdownMenuItemText strong>{label}</HeaderDropdownMenuItemText>
            </HeaderDropdownMenuItem>
          )
        })}
      </Menu>
    ),
    [changeItem, items]
  )

  return (
    <HeaderDropdownWrapper>
      <Dropdown disabled={disabled} overlay={menu} trigger={['click']} placement="bottomCenter">
        <HeaderDropdownContentWrapper>
          {!isDesktopView && <HeaderDropdownTitle>Currency</HeaderDropdownTitle>}
          <Row style={{ alignItems: 'center' }}>
            <HeaderDropdownMenuItemText strong>{selectedItem?.label ?? items[0]?.label}</HeaderDropdownMenuItemText>
            <DownIcon />
          </Row>
        </HeaderDropdownContentWrapper>
      </Dropdown>
    </HeaderDropdownWrapper>
  )
}

export default HeaderCurrency

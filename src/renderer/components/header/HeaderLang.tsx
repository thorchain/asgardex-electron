import React, { useMemo, useCallback } from 'react'

import { Row, Dropdown } from 'antd'
import { MenuProps } from 'antd/lib/menu'

import { ReactComponent as DownIcon } from '../../assets/svg/icon-down.svg'
import { LOCALES } from '../../i18n'
import { Locale } from '../../i18n/types'
import Menu from '../shared/Menu'
import {
  HeaderDropdownWrapper,
  HeaderDropdownMenuItem,
  HeaderDropdownContentWrapper,
  HeaderDropdownMenuItemText,
  HeaderDropdownTitle
} from './HeaderMenu.style'

type Props = {
  isDesktopView: boolean
  locale: Locale
  changeLocale?: (locale: Locale) => void
}

const HeaderLang: React.FC<Props> = (props: Props): JSX.Element => {
  const { isDesktopView, changeLocale = () => {}, locale } = props

  const changeLang: MenuProps['onClick'] = useCallback(
    ({ key }) => {
      changeLocale(key as Locale)
    },
    [changeLocale]
  )

  const menu = useMemo(
    () => (
      <Menu onClick={changeLang}>
        {LOCALES.map((locale: Locale) => {
          return (
            <HeaderDropdownMenuItem key={locale}>
              <HeaderDropdownMenuItemText strong>{locale}</HeaderDropdownMenuItemText>
            </HeaderDropdownMenuItem>
          )
        })}
      </Menu>
    ),
    [changeLang]
  )

  return (
    <HeaderDropdownWrapper>
      <Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
        <HeaderDropdownContentWrapper>
          {!isDesktopView && <HeaderDropdownTitle>Language</HeaderDropdownTitle>}
          <Row style={{ alignItems: 'center' }}>
            <HeaderDropdownMenuItemText strong>{locale || ''}</HeaderDropdownMenuItemText>
            <DownIcon />
          </Row>
        </HeaderDropdownContentWrapper>
      </Dropdown>
    </HeaderDropdownWrapper>
  )
}

export default HeaderLang

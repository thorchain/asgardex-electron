import React, { useMemo, useCallback } from 'react'

import { Row, Dropdown } from 'antd'
import { ClickParam } from 'antd/lib/menu'
import { useObservableState } from 'observable-hooks'

import { ReactComponent as DownIcon } from '../../assets/svg/icon-down.svg'
import { useI18nContext } from '../../contexts/I18nContext'
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
}

const HeaderLang: React.FC<Props> = (props: Props): JSX.Element => {
  const { isDesktopView } = props

  const { changeLocale, locale$ } = useI18nContext()
  const currentLocale = useObservableState(locale$)

  const changeLang = useCallback(
    ({ key }: ClickParam) => {
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
            <HeaderDropdownMenuItemText strong>{currentLocale || ''}</HeaderDropdownMenuItemText>
            <DownIcon />
          </Row>
        </HeaderDropdownContentWrapper>
      </Dropdown>
    </HeaderDropdownWrapper>
  )
}

export default HeaderLang

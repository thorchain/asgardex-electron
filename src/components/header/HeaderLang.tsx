import React, { useMemo, useCallback } from 'react'

import { Row, Dropdown } from 'antd'
import { Grid } from 'antd'
import { ClickParam } from 'antd/lib/menu'
import Text from 'antd/lib/typography/Text'
import { useObservableState } from 'observable-hooks'
import { palette } from 'styled-theme'

import { ReactComponent as DownIcon } from '../../assets/svg/icon-down.svg'
import { useI18nContext } from '../../contexts/I18nContext'
import { useThemeContext } from '../../contexts/ThemeContext'
import { LOCALES } from '../../i18n'
import { Locale } from '../../i18n/types'
import Menu from '../shared/Menu'
import { HeaderLangWrapper } from './HeaderLang.style'

type Props = {}

const HeaderLang: React.FC<Props> = (_: Props): JSX.Element => {
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)

  const { changeLocale, locale$ } = useI18nContext()
  const currentLocale = useObservableState(locale$)
  const isDesktopView = Grid.useBreakpoint().lg

  const changeLang = useCallback(
    ({ key }: ClickParam) => {
      changeLocale(key as Locale)
    },
    [changeLocale]
  )

  const color = useMemo(() => palette('text', 0)({ theme }), [theme])
  const itemStyle = { color, fontSize: '18px' }

  const menu = useMemo(
    () => (
      <Menu onClick={changeLang}>
        {LOCALES.map((locale: Locale) => {
          return (
            <Menu.Item
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 10px'
              }}
              key={locale}>
              <Text strong style={itemStyle}>
                {locale.toUpperCase()}
              </Text>
            </Menu.Item>
          )
        })}
      </Menu>
    ),
    [changeLang, itemStyle]
  )

  return (
    <HeaderLangWrapper>
      <Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
        {/* No need to have an anchor here */}
        <Row
          style={{
            justifyContent: 'space-between',
            paddingLeft: '15px',
            paddingRight: '15px',
            height: '60px',
            alignItems: 'center',
            width: '100%',
            cursor: 'pointer'
          }}>
          {!isDesktopView && <Text style={{ color }}>LANGUAGE</Text>}
          <Row style={{ alignItems: 'center' }}>
            <Text strong style={itemStyle}>
              {currentLocale?.toUpperCase()}
            </Text>
            <DownIcon />
          </Row>
        </Row>
      </Dropdown>
    </HeaderLangWrapper>
  )
}

export default HeaderLang

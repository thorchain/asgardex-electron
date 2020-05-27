import React, { useMemo, useCallback } from 'react'
import { Row, Dropdown } from 'antd'
import { palette } from 'styled-theme'

import Menu from '../shared/Menu'
import { useObservableState } from 'observable-hooks'
import { ReactComponent as DownIcon } from '../../assets/svg/icon-down.svg'
import { useThemeContext } from '../../contexts/ThemeContext'
import { HeaderLangWrapper } from './HeaderLang.style'

import { Locale } from '../../i18n/types'
import { LOCALES } from '../../i18n'
import Text from 'antd/lib/typography/Text'
import { useI18nContext } from '../../contexts/I18nContext'
import { ClickParam } from 'antd/lib/menu'
import { Grid } from 'antd'

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

  const menu = useMemo(() => {
    return (
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
    )
  }, [changeLang, itemStyle])

  return (
    <HeaderLangWrapper>
      <Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
        {/* `ant-dropdown-link` does need a height to give dropdown content an offset - dont't remove it! */}
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className="ant-dropdown-link" style={{ height: '40px' }} onClick={(e) => e.preventDefault()}>
          <Row
            style={{
              justifyContent: 'space-between',
              paddingLeft: '15px',
              paddingRight: '15px',
              height: '60px',
              alignItems: 'center',
              width: '100%'
            }}>
            {!isDesktopView && <Text style={{ color }}>LANGUAGE</Text>}
            <Row style={{ alignItems: 'center' }}>
              <Text strong style={itemStyle}>
                {currentLocale?.toUpperCase()}
              </Text>
              <DownIcon />
            </Row>
          </Row>
        </a>
      </Dropdown>
    </HeaderLangWrapper>
  )
}

export default HeaderLang

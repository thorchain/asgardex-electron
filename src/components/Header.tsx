import React, { useMemo, useCallback } from 'react'
import { useObservableState } from 'observable-hooks'

import { Menu, Select } from 'antd'
import { CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { walletHomeRoute, swapHomeRoute, stakeHomeRoute } from '../routes'
import { useConnectionContext, OnlineStatus } from '../contexts/ConnectionContext'
import { HeaderWrapper } from './Header.style'
import { useI18nContext } from '../contexts/I18nContext'
import { Locale } from '../i18n/types'
import { LOCALES } from '../i18n'

type Props = {}

enum MENU_ITEM_KEY {
  SWAP = 'swap',
  STAKE = 'stake',
  WALLET = 'wallet'
}

type MenuItem = {
  key: MENU_ITEM_KEY
  label: string
  path: string
}

const Header: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const connection$ = useConnectionContext()
  const onlineStatus = useObservableState<OnlineStatus>(connection$)

  const { changeLocale, locale$ } = useI18nContext()
  const currentLocale = useObservableState(locale$)

  const isOnline = onlineStatus === OnlineStatus.ON

  const matchSwapRoute = useRouteMatch(swapHomeRoute.path())
  const matchStakeRoute = useRouteMatch(stakeHomeRoute.path())
  const matchWalletRoute = useRouteMatch(walletHomeRoute.path())

  const activeKey: MENU_ITEM_KEY = useMemo(() => {
    if (matchSwapRoute) {
      return MENU_ITEM_KEY.SWAP
    } else if (matchStakeRoute) {
      return MENU_ITEM_KEY.STAKE
    } else if (matchWalletRoute) {
      return MENU_ITEM_KEY.WALLET
    } else {
      return MENU_ITEM_KEY.SWAP
    }
  }, [matchStakeRoute, matchSwapRoute, matchWalletRoute])

  const itemClickHandler = useCallback(
    (path: string) => {
      history.push(path)
    },
    [history]
  )

  const changeLocaleHandler = useCallback(
    (locale: Locale) => {
      changeLocale(locale)
    },
    [changeLocale]
  )

  const items = useMemo(
    () =>
      [
        { key: MENU_ITEM_KEY.SWAP, label: 'Swap', path: swapHomeRoute.path() },
        { key: MENU_ITEM_KEY.STAKE, label: 'Stake', path: stakeHomeRoute.path() },
        { key: MENU_ITEM_KEY.WALLET, label: 'Wallet', path: walletHomeRoute.path() }
      ] as MenuItem[],
    []
  )

  return (
    <HeaderWrapper>
      <Menu selectedKeys={[activeKey]} theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
        {items.map(({ label, path, key }) => {
          return (
            <Menu.Item key={key} onClick={() => itemClickHandler(path)}>
              {label}
            </Menu.Item>
          )
        })}
      </Menu>
      <div>
        <Select defaultValue={currentLocale} onChange={changeLocaleHandler} className="select-locale">
          {LOCALES.map((locale: Locale) => (
            <Select.Option value={locale} key={locale}>
              {locale.toUpperCase()}
            </Select.Option>
          ))}
        </Select>
        {isOnline && <CheckCircleOutlined style={{ color: '#a0d911', fontSize: '1.5em' }} />}
        {!isOnline && <MinusCircleOutlined style={{ color: '#ffa940', fontSize: '1.5em' }} />}
      </div>
    </HeaderWrapper>
  )
}

export default Header

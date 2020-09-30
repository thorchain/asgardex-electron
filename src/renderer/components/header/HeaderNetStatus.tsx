import React, { useMemo } from 'react'

import { Dropdown, Row, Col } from 'antd'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { ReactComponent as DownIcon } from '../../assets/svg/icon-down.svg'
import { useAppContext } from '../../contexts/AppContext'
import { OnlineStatus } from '../../services/app/types'
import ConnectionStatus from '../shared/icons/ConnectionStatus'
import Menu from '../shared/Menu'
import { HeaderDrawerItem } from './HeaderComponent.style'
import * as Styled from './HeaderNetStatus.style'
import { headerNetStatusSubheadline, headerNetStatusColor, HeaderNetStatusColor } from './util'

type MenuItem = {
  key: string
  headline: string
  subheadline: string
  color: HeaderNetStatusColor
}

type Props = {
  isDesktopView: boolean
  midgardUrl: O.Option<string>
  binanceUrl: O.Option<string>
}

const HeaderNetStatus: React.FC<Props> = (props): JSX.Element => {
  const { isDesktopView, midgardUrl, binanceUrl } = props
  const { onlineStatus$ } = useAppContext()
  const onlineStatus = useObservableState<OnlineStatus>(onlineStatus$, OnlineStatus.OFF)
  const intl = useIntl()
  const onlineStatusColor = onlineStatus === OnlineStatus.ON ? 'green' : 'red'

  const menuItems = useMemo((): MenuItem[] => {
    const notConnectedTxt = intl.formatMessage({ id: 'setting.notconnected' })
    return [
      {
        key: 'midgard',
        headline: 'Midgard API',
        subheadline: headerNetStatusSubheadline({ url: midgardUrl, onlineStatus, notConnectedTxt }),
        color: headerNetStatusColor({ url: midgardUrl, onlineStatus })
      },
      {
        key: 'binance',
        headline: 'Binance Chain',
        subheadline: headerNetStatusSubheadline({ url: binanceUrl, onlineStatus, notConnectedTxt }),
        color: headerNetStatusColor({ url: binanceUrl, onlineStatus })
      }
    ]
  }, [binanceUrl, intl, midgardUrl, onlineStatus])

  const desktopMenu = useMemo(() => {
    return (
      <Menu>
        {menuItems.map((item) => {
          const { headline, key, subheadline, color } = item
          return (
            <Menu.Item key={key}>
              <Row align="middle">
                <Col span={4}>
                  <ConnectionStatus color={color} />
                </Col>
                <Col span={20}>
                  <Styled.MenuItemHeadline>{headline}</Styled.MenuItemHeadline>
                  <Styled.MenuItemSubHeadline>{subheadline}</Styled.MenuItemSubHeadline>
                </Col>
              </Row>
            </Menu.Item>
          )
        })}
      </Menu>
    )
  }, [menuItems])

  const menuMobile = useMemo(() => {
    return menuItems.map((item, i) => {
      const { headline, key, subheadline, color } = item
      return (
        <HeaderDrawerItem key={key} className={i === menuItems.length - 1 ? 'last' : 'headerdraweritem'}>
          <Row align="middle" style={{ marginLeft: '15px', marginRight: '15px' }}>
            <ConnectionStatus color={color} />
          </Row>
          <Row>
            <Col>
              <Styled.MenuItemHeadline>{headline}</Styled.MenuItemHeadline>
              <Styled.MenuItemSubHeadline>{subheadline}</Styled.MenuItemSubHeadline>
            </Col>
          </Row>
        </HeaderDrawerItem>
      )
    })
  }, [menuItems])

  return (
    <Styled.Wrapper>
      {isDesktopView && (
        <Col span={24}>
          <Dropdown overlay={desktopMenu} trigger={['click']} placement="bottomCenter">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
              <Row justify="space-between" align="middle">
                <ConnectionStatus color={onlineStatusColor} />
                <DownIcon />
              </Row>
            </a>
          </Dropdown>
        </Col>
      )}
      {!isDesktopView && <Col span={24}>{menuMobile}</Col>}
    </Styled.Wrapper>
  )
}

export default HeaderNetStatus

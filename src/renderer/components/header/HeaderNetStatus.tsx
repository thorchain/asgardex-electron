import React, { useMemo } from 'react'

import { Dropdown, Row, Col } from 'antd'
import { useObservableState } from 'observable-hooks'

import { ReactComponent as DownIcon } from '../../assets/svg/icon-down.svg'
import { useAppContext } from '../../contexts/AppContext'
import { OnlineStatus } from '../../services/app/types'
import ConnectionStatus from '../shared/icons/ConnectionStatus'
import Menu from '../shared/Menu'
import { HeaderDrawerItem } from './HeaderComponent.style'
import * as Styled from './HeaderNetStatus.style'

type MenuItem = {
  key: string
  label: string
  url?: string
}

type Props = {
  isDesktopView: boolean
  midgardBasePath?: string
}

const HeaderNetStatus: React.FC<Props> = (props: Props): JSX.Element => {
  const { isDesktopView } = props
  const { onlineStatus$ } = useAppContext()
  const onlineStatus = useObservableState<OnlineStatus>(onlineStatus$)
  const onlineStatusColor = onlineStatus === OnlineStatus.ON ? 'green' : 'red'

  const menuItems: MenuItem[] = useMemo(
    () => [
      {
        key: 'binance',
        label: 'Binance Chain',
        url: ''
      },
      {
        key: 'midgard',
        label: 'Midgard API',
        url: ''
      }
    ],
    []
  )

  const desktopMenu = useMemo(() => {
    return (
      <Menu>
        {menuItems.map((item) => {
          const { label, key, url } = item
          return (
            <Menu.Item key={key}>
              <Row align="middle">
                <Col span={4}>
                  <ConnectionStatus color={url ? 'green' : 'yellow'} />
                </Col>
                <Col span={20}>
                  <Styled.MenuItemHeadline>{label}</Styled.MenuItemHeadline>
                  <Styled.MenuItemSubHeadline>{url || 'unknown'}</Styled.MenuItemSubHeadline>
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
      const { label, key, url } = item
      return (
        <HeaderDrawerItem key={key} className={i === menuItems.length - 1 ? 'last' : 'headerdraweritem'}>
          <Row align="middle" style={{ marginLeft: '15px', marginRight: '15px' }}>
            <ConnectionStatus color={url ? 'green' : 'yellow'} />
          </Row>
          <Row>
            <Col>
              <Styled.MenuItemHeadline>{label}</Styled.MenuItemHeadline>
              <Styled.MenuItemSubHeadline>{url || 'unknown'}</Styled.MenuItemSubHeadline>
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

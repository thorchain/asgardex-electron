import React, { useMemo } from 'react'

import { Dropdown, Row, Col } from 'antd'
import Paragraph from 'antd/lib/typography/Paragraph'
import { useObservableState } from 'observable-hooks'
import { palette } from 'styled-theme'

import { ReactComponent as DownIcon } from '../../assets/svg/icon-down.svg'
import { useConnectionContext, OnlineStatus } from '../../contexts/ConnectionContext'
import { useThemeContext } from '../../contexts/ThemeContext'
import ConnectionStatus from '../shared/icons/ConnectionStatus'
import Menu from '../shared/Menu'
import { HeaderDrawerItem } from './Header.style'
import { HeaderNetStatusWrapper } from './HeaderNetStatus.style'

type MenuItem = {
  key: string
  label: string
  url?: string
}

type Props = {
  midgardBasePath?: string
}

const HeaderNetStatus: React.FC<Props> = (_: Props): JSX.Element => {
  const { theme$ } = useThemeContext()
  const theme = useObservableState(theme$)
  const connection$ = useConnectionContext()
  const onlineStatus = useObservableState<OnlineStatus>(connection$)
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

  const menu = useMemo(() => {
    const color = palette('text', 0)({ theme })
    return (
      <Menu>
        {menuItems.map((item) => {
          const { label, key, url } = item
          return (
            <Menu.Item
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 10px'
              }}
              key={key}>
              <Row align="middle" style={{ marginRight: '5px' }}>
                <ConnectionStatus color={url ? 'green' : 'yellow'} />
              </Row>
              <Row>
                <Col>
                  <Paragraph
                    strong
                    style={{
                      textTransform: 'capitalize',
                      color,
                      marginBottom: 0
                    }}>
                    {label}
                  </Paragraph>
                  <Paragraph
                    style={{
                      paddingLeft: '10px',
                      textTransform: 'lowercase',
                      color,
                      marginBottom: 0
                    }}>
                    {url || 'unknown'}
                  </Paragraph>
                </Col>
              </Row>
            </Menu.Item>
          )
        })}
      </Menu>
    )
  }, [menuItems, theme])

  const menuMobile = menuItems.map((item, i) => {
    const { label, key, url } = item
    const color = palette('text', 0)({ theme })
    return (
      <HeaderDrawerItem key={key} className={i === menuItems.length - 1 ? 'last' : 'headerdraweritem'}>
        <Row align="middle" style={{ marginLeft: '15px', marginRight: '15px' }}>
          <ConnectionStatus color={url ? 'green' : 'yellow'} />
        </Row>
        <Row>
          <Col>
            <Paragraph
              strong
              style={{
                textTransform: 'capitalize',
                color,
                marginBottom: 0
              }}>
              {label}
            </Paragraph>
            <Paragraph
              style={{
                paddingLeft: '10px',
                textTransform: 'lowercase',
                color,
                marginBottom: 0
              }}>
              {url || 'unknown'}
            </Paragraph>
          </Col>
        </Row>
      </HeaderDrawerItem>
    )
  })

  return (
    <HeaderNetStatusWrapper>
      <Col xs={0} sm={0} md={0} lg={24}>
        <Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
            <Row justify="space-between" align="middle">
              <ConnectionStatus color={onlineStatusColor} />
              <DownIcon />
            </Row>
          </a>
        </Dropdown>
      </Col>
      <Col lg={0} xl={0} style={{ width: '100%' }}>
        {menuMobile}
      </Col>
    </HeaderNetStatusWrapper>
  )
}

export default HeaderNetStatus

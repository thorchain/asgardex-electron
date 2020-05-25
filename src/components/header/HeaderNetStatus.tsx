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

  return (
    <HeaderNetStatusWrapper>
      <Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
          <Row justify="space-between" align="middle">
            <ConnectionStatus color={onlineStatusColor} />
            <DownIcon />
          </Row>
        </a>
      </Dropdown>
    </HeaderNetStatusWrapper>
  )
}

export default HeaderNetStatus

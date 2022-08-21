import React, { useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Dropdown, Row, Col } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { useAppContext } from '../../../contexts/AppContext'
import { OnlineStatus } from '../../../services/app/types'
import { InboundAddressRD } from '../../../services/midgard/types'
import { MimirRD } from '../../../services/thorchain/types'
import { DownIcon } from '../../icons'
import { ConnectionStatus } from '../../shared/icons/ConnectionStatus'
import { Menu } from '../../shared/menu/Menu'
import { headerNetStatusSubheadline, headerNetStatusColor, HeaderNetStatusColor } from '../Header.util'
import { HeaderDrawerItem } from '../HeaderComponent.styles'
import * as Styled from './HeaderNetStatus.styles'

type MenuItem = {
  key: string
  headline: string
  url: string
  subheadline: string
  color: HeaderNetStatusColor
}

export type Props = {
  isDesktopView: boolean
  midgardStatus: InboundAddressRD
  mimirStatus: MimirRD
  midgardUrl: RD.RemoteData<Error, string>
  thorchainUrl: string
}

export const HeaderNetStatus: React.FC<Props> = (props): JSX.Element => {
  const {
    isDesktopView,
    midgardStatus: midgardStatusRD,
    mimirStatus: mimirStatusRD,
    midgardUrl: midgardUrlRD,
    thorchainUrl
  } = props
  const intl = useIntl()

  const midgardUrl = useMemo(() => {
    return FP.pipe(
      midgardUrlRD,
      RD.fold(
        () => '',
        () => '',
        () => '',
        (url) => url
      )
    )
  }, [midgardUrlRD])

  const prevMidgardStatus = useRef<OnlineStatus>(OnlineStatus.OFF)
  const midgardStatus: OnlineStatus = useMemo(
    () =>
      FP.pipe(
        midgardStatusRD,
        RD.fold(
          () => prevMidgardStatus.current,
          () => prevMidgardStatus.current,
          () => {
            prevMidgardStatus.current = OnlineStatus.OFF
            return prevMidgardStatus.current
          },
          () => {
            prevMidgardStatus.current = OnlineStatus.ON
            return prevMidgardStatus.current
          }
        )
      ),
    [midgardStatusRD]
  )

  const prevThorchainStatus = useRef<OnlineStatus>(OnlineStatus.OFF)
  const thorchainStatus: OnlineStatus = useMemo(
    () =>
      FP.pipe(
        mimirStatusRD,
        RD.fold(
          () => prevThorchainStatus.current,
          () => prevThorchainStatus.current,
          () => {
            prevThorchainStatus.current = OnlineStatus.OFF
            return prevThorchainStatus.current
          },
          () => {
            prevThorchainStatus.current = OnlineStatus.ON
            return prevThorchainStatus.current
          }
        )
      ),
    [mimirStatusRD]
  )

  const { onlineStatus$ } = useAppContext()
  const onlineStatus = useObservableState<OnlineStatus>(onlineStatus$, OnlineStatus.OFF)
  const appOnlineStatusColor = useMemo(() => {
    if (onlineStatus === OnlineStatus.OFF) return 'red'
    if (midgardStatus === OnlineStatus.OFF || thorchainStatus === OnlineStatus.OFF) return 'yellow'
    return 'green'
  }, [midgardStatus, onlineStatus, thorchainStatus])

  const menuItems = useMemo((): MenuItem[] => {
    const notConnectedTxt = intl.formatMessage({ id: 'setting.notconnected' })
    return [
      {
        key: 'midgard',
        headline: 'Midgard API',
        url: `${midgardUrl}/v2/doc`,
        subheadline: headerNetStatusSubheadline({
          url: O.some(midgardUrl),
          onlineStatus: onlineStatus,
          clientStatus: midgardStatus,
          notConnectedTxt
        }),
        color: headerNetStatusColor({ onlineStatus: onlineStatus, clientStatus: midgardStatus })
      },
      {
        key: 'thorchain',
        headline: 'Thorchain API',
        url: `${thorchainUrl}/thorchain/doc/`,
        subheadline: headerNetStatusSubheadline({
          url: O.some(thorchainUrl),
          onlineStatus: onlineStatus,
          clientStatus: thorchainStatus,
          notConnectedTxt
        }),
        color: headerNetStatusColor({ onlineStatus: onlineStatus, clientStatus: thorchainStatus })
      }
    ]
  }, [intl, midgardStatus, midgardUrl, onlineStatus, thorchainStatus, thorchainUrl])

  const desktopMenu = useMemo(() => {
    return (
      <Menu>
        {menuItems.map((item) => {
          const { headline, key, subheadline, color, url } = item
          return (
            <Menu.Item key={key} onClick={() => window.apiUrl.openExternal(url)}>
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
          <Dropdown overlay={desktopMenu} trigger={['click']} placement="bottom">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
              <Row justify="space-between" align="middle">
                <ConnectionStatus color={appOnlineStatusColor} />
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

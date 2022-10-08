import React, { useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Dropdown, Row, Col } from 'antd'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import * as FP from 'fp-ts/function'
import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { useAppContext } from '../../../contexts/AppContext'
import { OnlineStatus } from '../../../services/app/types'
import { MidgardStatusRD, MidgardUrlRD } from '../../../services/midgard/types'
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
  midgardStatus: MidgardStatusRD
  mimirStatus: MimirRD
  midgardUrl: MidgardUrlRD
  thorchainNodeUrl: string
  thorchainRpcUrl: string
}

export const HeaderNetStatus: React.FC<Props> = (props): JSX.Element => {
  const {
    isDesktopView,
    midgardStatus: midgardStatusRD,
    mimirStatus: mimirStatusRD,
    midgardUrl: midgardUrlRD,
    thorchainNodeUrl,
    thorchainRpcUrl
  } = props
  const intl = useIntl()

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
    const midgardUrl = FP.pipe(
      midgardUrlRD,
      RD.getOrElse(() => '')
    )

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
        url: `${thorchainNodeUrl}/thorchain/doc/`,
        subheadline: headerNetStatusSubheadline({
          url: O.some(thorchainNodeUrl),
          onlineStatus: onlineStatus,
          clientStatus: thorchainStatus,
          notConnectedTxt
        }),
        color: headerNetStatusColor({ onlineStatus: onlineStatus, clientStatus: thorchainStatus })
      },
      {
        key: 'thorchain-rpc',
        headline: 'Thorchain RPC',
        url: `${thorchainRpcUrl}`,
        subheadline: headerNetStatusSubheadline({
          url: O.some(thorchainRpcUrl),
          onlineStatus: onlineStatus,
          clientStatus: thorchainStatus,
          notConnectedTxt
        }),
        color: headerNetStatusColor({ onlineStatus: onlineStatus, clientStatus: thorchainStatus })
      }
    ]
  }, [intl, midgardUrlRD, thorchainNodeUrl, thorchainRpcUrl, onlineStatus, midgardStatus, thorchainStatus])

  const desktopMenu = useMemo(() => {
    return (
      <Menu
        items={FP.pipe(
          menuItems,
          A.map<MenuItem, ItemType>((item) => {
            const { headline, key, subheadline, color, url } = item
            return {
              label: (
                <Row align="middle" onClick={() => window.apiUrl.openExternal(url)}>
                  <Col span={4}>
                    <ConnectionStatus color={color} />
                  </Col>
                  <Col span={20}>
                    <Styled.MenuItemHeadline nowrap>{headline}</Styled.MenuItemHeadline>
                    <Styled.MenuItemSubHeadline nowrap>{subheadline}</Styled.MenuItemSubHeadline>
                  </Col>
                </Row>
              ),
              key
            }
          })
        )}
      />
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
              <Styled.MenuItemHeadline nowrap>{headline}</Styled.MenuItemHeadline>
              <Styled.MenuItemSubHeadline nowrap>{subheadline}</Styled.MenuItemSubHeadline>
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

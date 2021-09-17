import React, { useMemo, useRef } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Dropdown, Row, Col } from 'antd'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'

import { ReactComponent as DownIcon } from '../../../assets/svg/icon-down.svg'
import { useAppContext } from '../../../contexts/AppContext'
import { OnlineStatus } from '../../../services/app/types'
import { InboundAddressRD } from '../../../services/midgard/types'
import { MimirHaltRD } from '../../../services/thorchain/types'
import { ConnectionStatus } from '../../shared/icons/ConnectionStatus'
import { Menu } from '../../shared/menu/Menu'
import { headerNetStatusSubheadline, headerNetStatusColor, HeaderNetStatusColor } from '../Header.util'
import { HeaderDrawerItem } from '../HeaderComponent.styles'
import * as Styled from './HeaderNetStatus.styles'

type MenuItem = {
  key: string
  headline: string
  subheadline: string
  color: HeaderNetStatusColor
}

type Props = {
  isDesktopView: boolean
  midgardStatus: InboundAddressRD
  mimirStatus: MimirHaltRD
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

  const { onlineStatus$ } = useAppContext()
  const onlineStatus = useObservableState<OnlineStatus>(onlineStatus$, OnlineStatus.OFF)
  const onlineStatusColor = onlineStatus === OnlineStatus.ON ? 'green' : 'red'

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

  const menuItems = useMemo((): MenuItem[] => {
    const notConnectedTxt = intl.formatMessage({ id: 'setting.notconnected' })
    return [
      {
        key: 'midgard',
        headline: 'Midgard API',
        subheadline: headerNetStatusSubheadline({
          url: O.some(midgardUrl),
          onlineStatus: midgardStatus,
          notConnectedTxt
        }),
        color: headerNetStatusColor({ onlineStatus: midgardStatus })
      },
      {
        key: 'thorchain',
        headline: 'Thorchain API',
        subheadline: headerNetStatusSubheadline({
          url: O.some(thorchainUrl),
          onlineStatus: thorchainStatus,
          notConnectedTxt
        }),
        color: headerNetStatusColor({ onlineStatus: thorchainStatus })
      }
    ]
  }, [intl, midgardStatus, midgardUrl, thorchainStatus, thorchainUrl])

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

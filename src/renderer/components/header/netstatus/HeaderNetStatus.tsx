import React, { useMemo } from 'react'

import * as RD from '@devexperts/remote-data-ts'
import { Dropdown, Row, Col } from 'antd'
import * as FP from 'fp-ts/function'
import { useIntl } from 'react-intl'

import { ReactComponent as DownIcon } from '../../../assets/svg/icon-down.svg'
import { MimirHaltRD } from '../../../services/thorchain/types'
import { ConnectionStatus } from '../../shared/icons/ConnectionStatus'
import { Menu } from '../../shared/menu/Menu'
import { headerNetStatusSubheadline, headerNetStatusColor, HeaderNetStatusColor } from '../Header.util'
import { InboundAddressRD } from '../HeaderComponent'
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
  inboundAddress: InboundAddressRD
  mimirHalt: MimirHaltRD
}

export const HeaderNetStatus: React.FC<Props> = (props): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isDesktopView, inboundAddress: inboundAddressRD, mimirHalt: mimirHaltRD } = props
  // const { onlineStatus$ } = useAppContext()
  // const onlineStatus = useObservableState<OnlineStatus>(onlineStatus$, OnlineStatus.OFF)
  const intl = useIntl()

  const onlineStatusX: boolean = useMemo(
    () =>
      FP.pipe(
        inboundAddressRD,
        RD.fold(
          () => false,
          () => false,
          () => false,
          () => true
        )
      ),

    [inboundAddressRD]
  )

  const midgardStatusX: boolean = useMemo(
    () =>
      FP.pipe(
        mimirHaltRD,
        RD.fold(
          () => false,
          () => false,
          () => false,
          () => true
        )
      ),
    [mimirHaltRD]
  )

  const menuItems = useMemo((): MenuItem[] => {
    const notConnectedTxt = intl.formatMessage({ id: 'setting.notconnected' })
    console.log('online', onlineStatusX)
    console.log('midgard', midgardStatusX)
    return [
      {
        key: 'midgard',
        headline: 'Midgard API',
        subheadline: headerNetStatusSubheadline({
          url: 'midgard.thorchain.info',
          onlineStatus: onlineStatusX,
          notConnectedTxt
        }),
        color: headerNetStatusColor({ onlineStatus: onlineStatusX })
      },
      {
        key: 'thorchain',
        headline: 'Thorchain API',
        subheadline: headerNetStatusSubheadline({
          url: 'thornode.thorchain.info',
          onlineStatus: midgardStatusX,
          notConnectedTxt
        }),
        color: headerNetStatusColor({ onlineStatus: midgardStatusX })
      }
    ]
  }, [intl, midgardStatusX, onlineStatusX])

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
                <ConnectionStatus color={onlineStatusX && midgardStatusX ? 'green' : 'red'} />
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

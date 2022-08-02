import { Layout, Row, Drawer } from 'antd'
import Text from 'antd/lib/typography/Text'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { palette, size } from 'styled-theme'

import { Network } from '../../../shared/api/types'
import { ReactComponent as UIAsgardexLogo } from '../../assets/svg/logo-asgardex.svg'
import { media } from '../../helpers/styleHelper'

export const HeaderContainer = styled(Layout.Header)`
  height: ${size('headerHeight', '70px')};
  width: 100vw;
  background-color: ${palette('background', 0)};

  /* id's defined in svg */
  #asgardex_logo {
    > * {
      fill: ${palette('text', 1)};
    }
  }
  /* Make sure following id's are defined in svg */
  #swap_icon,
  #stake_icon,
  #wallet_icon,
  #menu_icon,
  #close_icon,
  #theme_switch_icon {
    & > * {
      fill: ${palette('text', 1)};
    }
  }

  /* Make sure following id's are defined in svg */
  #theme_switch_icon,
  #lock_icon,
  #unlock_icon,
  #settings_icon {
    cursor: pointer;
  }

  .ant-tabs-nav {
    &::before {
      /* hide border */
      border-bottom: 0;
    }
  }

  .ant-tabs-bar {
    border-bottom: 0;
  }

  .ant-tabs-tab {
    padding: 0 20px;
  }

  .ant-tabs-tab-active {
  }

  .ant-tabs-ink-bar {
    height: 5px;
    background: ${palette('gradient', 0)};
  }

  padding: 0 5px;

  ${media.lg`
    padding: 0 20px;
  `}
`

export const AsgardexLogo = styled(UIAsgardexLogo)`
  margin-top: 8px;
`

export const NetworkLabel = styled(Text)<{ network: Network }>`
  position: absolute;
  right: 19px;
  bottom: -13px;
  text-transform: uppercase;
  padding: 0;
  font-family: 'MainFontRegular';
  font-size: 12px;

  color: ${({ network }) => {
    switch (network) {
      case 'mainnet':
        return palette('primary', 0)
      case 'stagenet':
        return palette('danger', 1)
      case 'testnet':
        return palette('warning', 0)
      default:
        return palette('text', 2)
    }
  }};
`

export const LogoWrapper = styled.div`
  position: relative;
  height: ${size('headerHeight', '70px')};
`
export const TabsWrapper = styled(Row).attrs({
  justify: 'center',
  align: 'bottom'
})`
  height: ${size('headerHeight', '70px')};
`

type TabLinkProps = {
  selected: boolean
}

export const TabLink = styled(Link)`
  display: block;
  color: ${(props: TabLinkProps) => (props.selected ? palette('text', 1) : palette('text', 2))};
  transition: none;

  &:hover,
  &:active {
    color: ${palette('primary', 0)};
    #swap_icon,
    #stake_icon,
    #wallet_icon {
      > * {
        fill: ${palette('primary', 0)};
      }
    }
  }
  & > * {
    text-transform: uppercase;
    font-family: 'MainFontSemiBold';
    font-size: 18px;
  }
`

export const HeaderDrawer = styled(Drawer)`
  .ant-drawer-body {
    margin: 4px 4px 0px 4px;
    padding: 0;
    border-radius: 5px;
    background-color: ${palette('background', 0)};
  }

  .ant-drawer-content {
    background-color: transparent;
  }

  /* Make sure following id's are defined in svg */
  #swap_icon,
  #stake_icon,
  #wallet_icon {
    & > * {
      fill: currentColor;
    }
  }
`

export const HeaderDrawerItem = styled(Row)<{ selected?: boolean }>`
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-color: ${palette('background', 2)};

  align-items: center;
  transition: none;
  height: 60px;
  display: flex;
  text-transform: uppercase;
  font-family: 'MainFontSemiBold';
  font-size: 18px;
  color: ${({ selected }) => (selected ? palette('primary', 0) : palette('text', 1))};
  &.last {
    border: none;
  }
`

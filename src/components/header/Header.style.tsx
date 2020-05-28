import { Layout, Row, Drawer } from 'antd'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { palette, size } from 'styled-theme'

import { Z_INDEX_MAP, media } from '../../helpers/styleHelper'

export const HeaderContainer = styled(Layout.Header)`
  position: fixed;
  z-index: ${Z_INDEX_MAP.header};
  height: ${size('headerHeight', '50px')};
  width: 100vw;
  background-color: ${palette('background', 0)};

  /* id's defined in svg */
  #asgardex_logo {
    > :not(:first-child) {
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
  #settings_icon {
    cursor: pointer;
  }

  #settings_icon {
    & > * {
      fill: ${palette('primary', 0)};
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
    height: 3px;
    background: ${palette('gradient', 0)};
  }

  padding: 0 5px;

  ${media.lg`
      padding: 0 50px;
    `}
`

type TabLinkProps = {
  selected: boolean
}

export const TabLink = styled(Link)`
  border-bottom-width: '3px';
  border-color: ${palette('primary', 0)};
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
  }

  .ant-drawer-content {
    background-color: transparent;
  }

  /* Make sure following id's are defined in svg */
  #swap_icon,
  #stake_icon,
  #wallet_icon {
    & > * {
      fill: ${palette('text', 1)};
    }
  }
`

export const HeaderDrawerItem = styled(Row)`
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-color: ${palette('background', 2)};
  background-color: ${palette('background', 0)};
  align-items: center;
  transition: none;
  height: 60px;
  display: flex;
  text-transform: uppercase;
  font-family: 'MainFontSemiBold';
  font-size: 18px;
  color: ${palette('text', 1)};
  &.last {
    border: none;
  }
`

import styled from 'styled-components'
import { Layout } from 'antd'
import { palette, size } from 'styled-theme'
import { Z_INDEX_MAP } from '../../helpers/styleHelper'
import { Link } from 'react-router-dom'

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

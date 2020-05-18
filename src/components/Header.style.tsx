import styled from 'styled-components'
import { Layout } from 'antd'
import { palette, size, key } from 'styled-theme'
import { Z_INDEX_MAP } from '../helpers/styleHelper'
import { Link } from 'react-router-dom'

export const HeaderContainer = styled(Layout.Header)`
  position: fixed;
  z-index: ${Z_INDEX_MAP.header};
  height: ${size('headerHeight', '50px')};
  width: 100vw;
  background-color: ${palette('background', 0)};

  /* Make sure following id is defined in svg */
  #asgardex_logo {
    cursor: pointer;
    > :not(:first-child) {
      fill: ${palette('text', 1)};
    }
  }

  /* Make sure following id's are defined in svg */
  #swap_icon,
  #stake_icon,
  #wallet_icon,
  #theme_switch_icon {
    cursor: pointer;
    & > * {
      fill: ${palette('text', 1)};
    }
  }

  .ant-tabs-bar {
    border-bottom: 0;
  }

  .ant-tabs-tab {
    padding: 0 10px;
  }

  .ant-tabs-ink-bar {
    height: 3px;
    background: ${palette('gradient', 0)};
  }
`

export const TabLink = styled(Link)`
  border-bottom-width: '3px';
  border-color: ${palette('primary', 0)};
  color: ${palette('text', 1)};
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
    font-size: ${key('sizes.font.big', '15px')};
  }
`

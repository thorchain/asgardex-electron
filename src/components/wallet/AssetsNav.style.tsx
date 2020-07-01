import styled from 'styled-components'
import { palette } from 'styled-theme'

import Menu from '../shared/Menu'

export const StyledMenu = styled(Menu)`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 0.5px solid #969dab;

  .ant-menu-item:hover,
  .ant-menu-submenu:hover,
  .ant-menu-item-active,
  .ant-menu-submenu-active,
  .ant-menu-item-open,
  .ant-menu-submenu-open,
  .ant-menu-item-selected,
  .ant-menu-submenu-selected {
    border-bottom: 2px solid ${palette('primary', 0)};
  }

  .ant-menu-item {
    color: ${palette('text', 0)};
    font-family: 'MainFontSemiBold';
    font-size: 16px;
  }

  .ant-menu-item a {
    color: ${palette('text', 0)};
    text-transform: uppercase;
  }

  .ant-menu-item a:hover {
    color: ${palette('primary', 0)};
  }

  .ant-menu-item-active a,
  .ant-menu-item-selected a {
    color: ${palette('primary', 0)};
  }
`

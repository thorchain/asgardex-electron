import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Menu } from '../../shared/menu'

export const StyledMenu = styled(Menu)`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid ${palette('gray', 1)};

  &.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item:active,
  &.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item:hover,
  &.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-selected {
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

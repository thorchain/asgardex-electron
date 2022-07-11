import styled, { createGlobalStyle } from 'styled-components'
import { palette } from 'styled-theme'

import { Menu as MenuUI } from '../../shared/menu'

const commonItemStyles = `
  .ant-menu-item {
    font-family: 'MainFontSemiBold';
    font-size: 16px;
    color: ${palette('text', 0)};
  }

  .ant-menu-item a {
    color: ${palette('text', 0)};
    text-transform: uppercase;
  }
`

export const Menu = styled(MenuUI)`
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid ${palette('gray', 1)};

  &.ant-menu-horizontal .ant-menu-item,
  &.ant-menu-horizontal > .ant-menu-item::after {
    transition: none;
  }

  &.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-selected {
    border-bottom: 2px solid ${palette('primary', 0)};
  }

  &.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item:hover::after,
  &.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-active::after,
  &.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-open::after,
  &.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-selected::after {
    border-bottom: none;
  }

  ${commonItemStyles}

  .ant-menu-item {
    color: ${palette('text', 0)};
  }

  .ant-menu-item a {
    color: ${palette('text', 0)};
  }

  .ant-menu-item a:hover {
    color: ${palette('primary', 0)};
  }

  .ant-menu-item-active a,
  .ant-menu-item-selected a {
    color: ${palette('primary', 0)};
  }

  .ant-menu-submenu {
    border-color: ${palette('primary', 0)} !important;

    .ant-menu-submenu-title {
      color: ${palette('text', 0)};

      &:hover {
        color: ${palette('primary', 0)};
      }
    }
  }
`

/**
 * Used as global styles as Ant renders extra-content as dropdown in a React.Portal
 * and we can not style it with Menu
 */
export const MenuDropdownGlobalStyles = createGlobalStyle`
  .ant-menu-submenu.ant-menu-submenu-popup {
    .ant-menu.ant-menu-sub  {
        background: ${palette('background', 0)};

        ${commonItemStyles}

        .ant-menu-item {
            color: ${palette('text', 0)};
         }

         .ant-menu-item a {
           color: ${palette('text', 0)};
         }

         .ant-menu-item a:hover {
           color: ${palette('primary', 0)};
         }

         .ant-menu-item-active a,
         .ant-menu-item-selected a {
           color: ${palette('primary', 0)};
         }
    }
}
`

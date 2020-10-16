import { Menu as AntdMenu } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Menu = styled(AntdMenu)`
  background: ${palette('background', 1)};
  li.ant-dropdown-menu-item {
    color: ${palette('text', 0)};
    &:hover,
    &.ant-dropdown-menu-item-selected {
      color: ${palette('text', 1)};
      background: ${palette('secondary', 1)};
    }
  }
`

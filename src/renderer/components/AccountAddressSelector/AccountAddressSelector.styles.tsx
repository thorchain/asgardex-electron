import { CaretDownOutlined as CaretDownOutlinedUI } from '@ant-design/icons'
import { Menu as MenuUI } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const DropdownSelectorWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid ${palette('primary', 0)};
  border-radius: 5px;
  padding-left: 7px;

  & .anticon-caret-down {
    transition: transform 0.3s;
    transform: translateY(0px);
    & > svg {
      width: 100%;
      height: 100%;
    }
  }
  & .ant-select-selection {
    background-color: transparent;
  }
  &.ant-dropdown-open {
    & .anticon-caret-down {
      transform: rotateZ(180deg);
    }
  }
`

export const WalletAddress = styled.div`
  margin: 5px 15px 5px 15px;
  color: ${palette('text', 2)};
`

export const TruncatedAddress = styled.div`
  margin: 5px 15px 5px 10px;
  font-size: 12px;
  color: ${palette('primary', 0)};
`

export const CaretDownOutlined = styled(CaretDownOutlinedUI)`
  margin-left: 5px;
  padding: 5px;
  color: ${palette('primary', 0)};
`

export const MenuItemWrapper = styled.div`
  display: flex;
  flex: row;
  align-items: center;
`

export const Menu = styled(MenuUI)`
  background-color: ${palette('background', 0)};
  & .ant-dropdown-menu-item {
    &:hover,
    &:focus,
    &:active {
      background: ${palette('background', 2)};
    }
    &-selected {
      background: ${palette('gray', 1)};
    }
  }
`

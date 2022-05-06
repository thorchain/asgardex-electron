import { CaretDownOutlined as CaretDownOutlinedUI } from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { AssetIcon as AssetIconUI } from '../uielements/assets/assetIcon/AssetIcon'
import { WalletTypeLabel as WalletTypeLabelUI } from '../uielements/common/Common.styles'

export const DropdownSelectorWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid ${palette('primary', 0)};
  border-radius: 5px;
  padding-left: 7px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

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
  font-size: 14px;
  color: ${palette('primary', 0)};
`

export const CaretDownOutlined = styled(CaretDownOutlinedUI)`
  margin-left: 5px;
  padding: 5px;
  color: ${palette('primary', 0)};
`

export const Menu = styled(A.Menu)`
  background-color: ${palette('background', 0)};

  & .ant-dropdown-menu-item {
    &:hover,
    &:focus,
    &:active {
      background: ${palette('background', 2)};
    }

    &-selected {
      background: ${palette('background', 2)};
    }
  }
`

export const MenuItem = styled(A.Menu.Item)`
  padding: 0;
  margin: 0;
`

export const MenuItemWrapper = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  padding: 5px;
  background-color: ${({ selected }) => (selected ? palette('background', 2) : 'inherit')};

  &:hover,
  &:active {
    background-color: palette('background', 2);
  }
`

export const AssetIcon = styled(AssetIconUI)`
  margin: 3px;
`

export const WalletTypeLabel = styled(WalletTypeLabelUI)<{ selected: boolean }>`
  line-height: 14px;

  background: ${({ selected }) => (selected ? palette('gray', 1) : palette('gray', 0))};
`

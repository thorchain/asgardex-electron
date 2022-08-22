import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ReactComponent as AllIconUI } from '../../assets/svg/filter-all.svg'
import { Button } from '../uielements/button'

export const Menu = styled(A.Menu)`
  background: ${palette('background', 0)};

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

export const FilterButton = styled(Button).attrs({ typevalue: 'outline' })`
  font-size: 14px !important;

  & .anticon-caret-down {
    width: 14px;
    height: 14px;
    transition: transform 0.3s;
    transform: translateY(0px);
    position: absolute !important;
    right: 7px;

    & > svg {
      width: 100%;
      height: 100%;
    }
  }
  &.ant-dropdown-open {
    & .anticon-caret-down {
      transform: rotateZ(180deg);
    }
  }
`

export const FilterItem = styled(Button).attrs({ typevalue: 'transparent' })`
  padding: 0;
  margin: 0;
  text-align: left;
  width: 100%;

  &.ant-btn {
    transition: none;
    color: ${palette('text', 0)} !important;
    display: inline-block;
  }
`

export const AllIcon = styled(AllIconUI)`
  margin-right: 10px;
`

export const AllContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 14px;
  font-family: 'MainFontRegular';
`

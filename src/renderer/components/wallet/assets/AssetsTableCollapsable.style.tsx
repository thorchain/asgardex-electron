import { CaretRightOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import UILabel from '../../../components/uielements/label'
import Table from '../../uielements/table'

export const TableWrapper = styled(Table)`
  .ant-table-thead > tr > th {
    font-size: 16px;
    font-weight: 600;
    text-transform: uppercase;
    height: 64px;
  }

  .ant-table-tbody > tr > td {
    padding: 0px 16px;
    height: 64px;
  }

  .ant-table-tbody > tr > td > div {
    font-size: 16px;
    font-weight: normal;
    text-transform: uppercase;
  }
`

export const HeaderRow = styled(A.Row)`
  font-size: 14px;
  font-family: 'MainFontRegular';
  color: ${palette('gray', 2)};
`

export const HeaderLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  size: 'normal'
})`
  padding: 0;
`

export const HeaderAddress = styled(UILabel).attrs({
  textTransform: 'none',
  color: 'gray',
  size: 'normal'
})`
  padding: 0;
`

export const Collapse = styled(A.Collapse)`
  &.ant-collapse-icon-position-right > .ant-collapse-item > .ant-collapse-header {
    background-color: ${palette('background', 2)};
    padding: 5px 20px;
  }

  &.ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding: 0;
  }
`

export const ExpandIcon = styled(CaretRightOutlined)`
  svg {
    color: ${palette('primary', 0)};
  }
`

export const HideIcon = styled(EyeInvisibleOutlined)`
  svg {
    color: ${palette('gray', 2)};
  }
  cursor: pointer;
`

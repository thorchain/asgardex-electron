import * as AIcons from '@ant-design/icons/lib'
import { Col as ACol } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { AddressEllipsis as UIAddressEllipsis } from '../../uielements/addressEllipsis'
import { Button as UIButton } from '../../uielements/button'
import { Label as UILabel } from '../../uielements/label'
import { Table as UITable } from '../../uielements/table'

export const Table = styled(UITable)`
  .ant-table-thead > tr {
    background: ${palette('gray', 0)};
    & > th {
      font-size: 16px;
      border: none;
      padding-top: 2px;
      padding-bottom: 2px;
      height: auto;
      background: none !important;
      color: ${palette('gray', 2)};
      font-weight: 300;

      &:hover {
        background: none !important;
      }
    }
  }

  .ant-table-tbody > tr > td {
    border: none;
  }
`

export const AddressEllipsis = styled(UIAddressEllipsis)`
  font-weight: 300;
  color: ${palette('text', 1)};
`

export const BondCol = styled(ACol)`
  width: 100px;
`

export const AwardCol = styled(ACol)`
  width: 80px;
`

export const InfoButton = styled(UIButton).attrs({
  typevalue: 'transparent'
})`
  &.ant-btn {
    display: inline-flex;
    color: inherit;
  }
`

export const InfoArrow = styled(AIcons.ArrowUpOutlined)`
  transform: rotateZ(45deg);
  color: ${palette('primary', 0)};
`

export const TextLabel = styled(UILabel).attrs({ textTransform: 'uppercase' })`
  color: inherit;
  line-height: 16px;
`

export const DeleteButton = styled(UIButton).attrs({ typevalue: 'transparent' })`
  &.ant-btn {
    min-width: auto;
    padding: 0;
    color: ${palette('error', 0)};

    &:hover {
      color: ${palette('error', 1)};
    }
  }
`

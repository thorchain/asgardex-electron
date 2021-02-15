import * as AIcons from '@ant-design/icons/lib'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ManageButton as ManageButtonUI } from '../manageButton'
import { Button as UIButton } from '../uielements/button'
import { Label as UILabel } from '../uielements/label'
import { Table as UITable } from '../uielements/table'

export const Container = styled('div')`
  background: ${palette('background', 0)};
`

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
    padding: 0px 16px;
  }

  .ant-table-tbody > tr > td > div {
    font-size: 16px;
    font-weight: normal;
    text-transform: uppercase;
  }
`

export const InfoButton = styled(UIButton).attrs({
  typevalue: 'transparent'
})`
  &.ant-btn {
    display: inline-flex;
    color: inherit;
  }
  margin-top: 30px;
  padding-left: 30px;
`

export const ManageButton = styled(ManageButtonUI)`
  &.ant-btn {
    display: inline-flex;
  }
`

export const InfoArrow = styled(AIcons.ArrowUpOutlined)`
  transform: rotateZ(45deg);
  color: ${palette('primary', 0)};
`

export const TextLabel = styled(UILabel).attrs({ textTransform: 'uppercase' })`
  color: ${palette('text', 0)};
  font-size: 16px;
  line-height: 22px;
`

export const InfoDescription = styled.div`
  padding-left: 30px;
  font-size: 16px;
  color: ${palette('gray', 2)};
  margin-bottom: 20px;
`

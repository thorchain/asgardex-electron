import * as AIcons from '@ant-design/icons/lib'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ManageButton as ManageButtonUI } from '../manageButton'
import { AssetIcon as AssetIconUI } from '../uielements/assets/assetIcon'
import { Button as UIButton } from '../uielements/button'
import { Label as UILabel } from '../uielements/label'
import { Table as UITable } from '../uielements/table'

export const Container = styled('div')`
  background: ${palette('background', 0)};
`

export const AssetIcon = styled(AssetIconUI)`
  position: relative;
`

export const AssetIconLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  size: 'small'
})`
  position: absolute;
  top: 6px;
  left: 45px;

  font-family: 'MainFontRegular';
  font-size: 8px;
  color: ${palette('text', 0)};

  background: ${palette('background', 3)};
  text-shadow: 1px 1px 1px ${palette('background', 1)};
  box-shadow: 0px 1px 2px ${palette('gray', 2)};
  border-radius: 5px;
  padding: 0px 5px;
  width: auto;
`

export const Table = styled(UITable)`
  .ant-table-thead > tr {
    background: ${palette('gray', 0)};
    & > th {
      font-size: 14px;
      border: none;
      padding-top: 2px;
      padding-bottom: 2px;
      padding-left: 30px;
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
  text-transform: uppercase;
  padding-left: 30px;
  font-size: 16px;
  color: ${palette('gray', 2)};
  margin-bottom: 20px;
`

export const OwnershipLabel = styled(UILabel)`
  padding-left: 30px;
  padding-right: 16px;
  font-size: 16px;
`

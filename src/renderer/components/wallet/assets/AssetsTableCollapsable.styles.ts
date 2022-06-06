import { CaretRightOutlined, EyeInvisibleOutlined, QrcodeOutlined as QrcodeOutlinedIcon } from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../../../components/uielements/label'
import { Button as UIButton } from '../../uielements/button'
import {
  WalletTypeLabel as WalletTypeLabelUI,
  AssetSynthLabel as AssetSynthLabelUI
} from '../../uielements/common/Common.styles'
import { Table as UITable } from '../../uielements/table'

export const Table = styled(UITable)`
  .ant-table-tbody > tr > td {
    padding: 0px 16px;
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

export const HeaderChainContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const HeaderLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  size: 'normal'
})`
  width: auto;
  margin-right: 10px;
  padding: 0;
`

export const HeaderAddress = styled(UILabel).attrs({
  textTransform: 'none',
  color: 'gray',
  size: 'normal'
})`
  padding: 0;
`

export const Label = styled(UILabel)`
  font-size: 16px;
`

export const TickerLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  weight: '600'
})`
  padding: 0px;
  font-size: 16px;
  line-height: 18px;
`

export const ChainLabelWrapper = styled.div`
  display: flex;
  align-items: center;
`

export const ChainLabel = styled(TickerLabel)`
  color: ${palette('gray', 2)};
  font-size: 12px;
  font-weight: 500;
`

export const Collapse = styled(A.Collapse)`
  &.ant-collapse > .ant-collapse-item > .ant-collapse-header {
    background-color: ${palette('background', 2)};
    border-bottom: 1px solid ${palette('gray', 1)};
    padding: 5px 20px;
  }

  &.ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-header-text {
    width: 100%;
  }

  &.ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    padding: 0;
  }
`

export const ExpandIcon = styled(CaretRightOutlined)`
  margin-top: -13px;
  svg {
    color: ${palette('primary', 0)};
  }
`

export const HideIcon = styled(EyeInvisibleOutlined)`
  svg {
    color: ${palette('gray', 2)};
  }
  /* TODO (@Veado)
    Change to pointer if hide asset feature is implemented
    see https://github.com/thorchain/asgardex-electron/issues/476
  */
  cursor: pointer;
`

const ICON_SIZE = 14

export const CopyLabelContainer = styled.span``

export const CopyLabel = styled(A.Typography.Text)`
  text-transform: uppercase;
  color: ${palette('primary', 0)};
  svg {
    color: ${palette('primary', 0)};
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const QRCodeIcon = styled(QrcodeOutlinedIcon)`
  cursor: pointer;
  margin-left: 5px;
  color: ${palette('primary', 0)};
  svg {
    color: inherit;
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const AssetTickerWrapper = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const UpgradeButton = styled(UIButton).attrs({
  type: 'primary',
  round: 'true',
  color: 'warning'
})`
  &.ant-btn {
    min-width: auto;
    margin-left: 10px;
  }
`

export const WalletTypeLabel = styled(WalletTypeLabelUI)`
  background: ${palette('gray', 1)};
  padding: 0 5px;
`

export const AssetSynthLabel = styled(AssetSynthLabelUI)`
  margin-top: 2px;
  padding: 0 4px;
  font-size: 10px;
  line-height: 12px;
`

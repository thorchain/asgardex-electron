import AIcon, { CaretRightOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ReactComponent as LedgerConnectUI } from '../../../assets/svg/ledger-device-connect.svg'
import { media } from '../../../helpers/styleHelper'
import { AssetIcon as AssetIconUI, TerraIcon as TerraIconUI } from '../../uielements/assets/assetIcon'
import { Button } from '../../uielements/button'
import { CopyLabel as CopyLabelUI } from '../../uielements/label'

export const LedgerContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`

export const LedgerConnect = styled(LedgerConnectUI)`
  transform: scale(0.65, 0.65);
  ${media.md`
  transform: scale(0.85, 0.85);
  `}
`

export const AssetIcon = styled(AssetIconUI)`
  position: absolute;
  top: 20px;
  left: 180px;
  transform: scale(0.7, 0.7);

  ${media.md`
    top: 21px;
    left: 170px;
    transform: scale(0.9, 0.9);
  `}
`

export const TerraIcon = styled(TerraIconUI)`
  position: absolute;
  top: 20px;
  left: 180px;
  transform: scale(0.7, 0.7);

  ${media.md`
    top: 21px;
    left: 170px;
    transform: scale(0.9, 0.9);
  `}
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`

export const Description = styled.p`
  font-family: 'MainFontRegular';
  font-size: 12;
  text-align: center;
`

export const NoteBCH = styled.p`
  font-family: 'MainFontRegular';
  font-size: 12;
  text-align: center;
`

export const Icon = styled(AIcon)`
  display: inline-block;
  margin-right: 5px;
  svg {
    width: 17px;
    height: 17px;
    stroke: ${palette('warning', 0)};
    fill: none;
  }
`
export const AddressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px 0 0 0;
`
export const AddressContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-transform: none;
  align-items: center;
`

export const AddressTitle = styled.p`
  font-family: 'MainFontBold';
  font-size: 10px;
  color: inherit;
  text-transform: uppercase;
  padding: 0;
  margin: 0;
`

export const CompareAddressButton = styled(Button)`
  box-shadow: none;
`

export const ExpandIcon = styled(CaretRightOutlined)`
  svg {
    color: inherit;
  }
`

export const CopyLabel = styled(CopyLabelUI)`
  padding-top: 20px;
  font-size: 12px;
`

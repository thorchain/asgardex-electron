import AIcon, { QrcodeOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { EyeOutlined as EyeOutlinedUI } from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ReactComponent as RemoveIcon } from '../../../assets/svg/icon-remove.svg'
import { AddressEllipsis as AddressEllipsisUI } from '../../../components/uielements/addressEllipsis'
import { Button as UIButton } from '../../../components/uielements/button'
import {
  ExternalLinkIcon as ExternalLinkIconUI,
  WalletTypeLabel as WalletTypeLabelUI
} from '../../../components/uielements/common/Common.styles'
import { Label as UILabel } from '../../../components/uielements/label'

export const ContainerWrapper = styled.div`
  margin: 0px 8px;
`

export const TitleWrapper = styled.div`
  margin: 0px -8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${palette('background', 1)};
  min-height: 70px;
`

export const Title = styled(UILabel)`
  color: ${palette('text', 1)};
  padding: 0 40px;
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-weight: 600;
  font-size: 22px;
  line-height: 22px;
`

export const Divider = styled(A.Divider)`
  margin: 0;
  border-top: 1px solid ${palette('gray', 0)};
`

export const Subtitle = styled(UILabel)`
  margin: 10px 0;
  color: ${palette('text', 0)};
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-weight: 600;
  font-size: 18px;
`

export const Row = styled(A.Row)`
  padding: 10px 30px 40px 30px;
  background-color: ${palette('background', 1)};

  .ant-row {
    margin: 0;
  }
`

export const WalletCol = styled(A.Col)`
  width: 100%;
`

export const Card = styled(A.Card)`
  padding-top: 20px;
  border-radius: 5px;
  background-color: ${palette('background', 1)};
  border: 1px solid ${palette('gray', 0)};
`

export const OptionCard = styled(A.Card)`
  .ant-card-body {
    padding: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${palette('background', 1)};
    width: 100%;
  }
`

export const OptionLabel = styled(UILabel)`
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  font-size: 14px;
  font-family: 'MainFontRegular';
  min-height: 38px;
`

export const Button = styled(UIButton)`
  font-family: 'MainFontRegular';
  text-transform: uppercase;

  span {
    font-size: 14px;
  }

  :disabled:hover {
    color: ${palette('primary', 0)} !important;
  }
`

export const AccountCard = styled(A.Card)`
  border: 1px solid ${palette('gray', 0)};

  .ant-card-body {
    padding: 0;
    background-color: ${palette('background', 1)};

    div > div > div > ul > li {
      border-bottom: 1px solid ${palette('gray', 0)};
    }
  }
`

export const ListItem = styled(A.List.Item)`
  padding: 40px;
  flex-direction: column;
  align-items: start;

  border-bottom: none;
  border-bottom: 1px solid ${palette('gray', 0)};
  .ant-list-item {
    border-bottom: 1px solid ${palette('gray', 0)};
  }
`

export const AccountTitleWrapper = styled.div`
  display: flex;
  align-items: center;
`

export const AccountTitle = styled(UILabel)`
  padding: 0px;
  padding-left: 15px;
  text-transform: uppercase;
  font-weight: normal;
  font-size: 27px;
  line-height: 25px;
  letter-spacing: 2px;
`

export const AccountContent = styled.div`
  width: 100%;
  overflow: hidden;
  margin: 0 40px;
`

export const AccountPlaceholder = styled(UILabel)`
  display: block;
  padding: 0px;
  margin-top: 3px;
  color: ${palette('text', 2)};
  font-family: 'MainFontRegular';
  font-size: 12px;
  text-transform: uppercase;
`

export const AddressContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`
const ICON_SIZE = 16

export const AddressWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`

export const AddressEllipsis = styled(AddressEllipsisUI)`
  font-size: 16px;
  font-family: 'MainFontRegular';
  color: ${palette('text', 1)};
  max-width: 100%;
  overflow: hidden;
  &:only-child {
    margin: auto;
  }
  & svg {
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const AddressLinkIcon = styled(ExternalLinkIconUI)`
  margin-left: 10px;
  height: ${ICON_SIZE}px;
  width: ${ICON_SIZE}px;
  color: ${palette('primary', 0)};
  svg {
    color: inherit;
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const QRCodeIcon = styled(QrcodeOutlined)`
  margin-left: 5px;
  cursor: pointer;
  color: ${palette('primary', 0)};
  height: ${ICON_SIZE}px;
  width: ${ICON_SIZE}px;

  & svg {
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const EyeOutlined = styled(EyeOutlinedUI)`
  cursor: pointer;
  color: ${palette('primary', 0)};
  height: ${ICON_SIZE}px;
  width: ${ICON_SIZE}px;

  & svg {
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const AddressError = styled(UILabel)`
  display: block;
  padding: 0;
  color: ${palette('error', 0)};
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-size: 14px;
`

export const AddLedgerButton = styled(UIButton).attrs({
  typevalue: 'transparent'
})`
  padding-left: 0;
  font-size: 17px;
  cursor: pointer;
`

export const AddLedgerIcon = styled(PlusCircleOutlined)`
  color: ${palette('primary', 0)};
`

export const RemoveLedgerIcon = styled(RemoveIcon)`
  margin-left: 5px;
  cursor: pointer;
  width: ${ICON_SIZE}px;
  height: ${ICON_SIZE}px;
`

export const AddLedgerContainer = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const IndexLabel = styled('div')`
  color: ${palette('text', 2)};
  text-transform: uppercase;
  font-size: 12px;
`

export const WalletIndexInput = styled(A.InputNumber)`
  color: ${palette('text', 2)};
  background-color: ${palette('background', 1)};
  margin-left: 10px;
  margin-right: 5px;
  max-width: 45px;
`

export const AddressToVerifyLabel = styled.span`
  display: block;
  color: inherit;
  font-family: 'MainFontBold';
  font-size: 16px;
  text-transform: none;
`

export const AccountAddressWrapper = styled.div`
  margin-top: 10px;
  width: 100%;
`

export const WalletTypeLabel = styled(WalletTypeLabelUI)`
  margin-left: 40px;
  display: inline-block;
`

export const NotSupportedWrapper = styled('div')`
  display: flex;
  align-items: center;
  margin-left: 40px;
  padding-top: 5px;
  color: ${palette('text', 2)};
  text-transform: uppercase;
  font-size: 12px;
`

export const Icon = styled(AIcon)`
  display: inline-block;
  margin-right: 5px;
  svg {
    width: 15px;
    height: 15px;
    stroke: ${palette('warning', 0)};
    fill: none;
  }
`

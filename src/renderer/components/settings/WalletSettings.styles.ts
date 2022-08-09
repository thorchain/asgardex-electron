import AIcon, { QrcodeOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { EyeOutlined as EyeOutlinedUI } from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ReactComponent as RemoveIcon } from '../../assets/svg/icon-remove.svg'
import { media } from '../../helpers/styleHelper'
import * as StyledR from '../shared/form/Radio.styles'
import { AddressEllipsis as AddressEllipsisUI } from '../uielements/addressEllipsis'
import { Button as UIButton } from '../uielements/button'
import {
  ExternalLinkIcon as ExternalLinkIconUI,
  WalletTypeLabel as WalletTypeLabelUI
} from '../uielements/common/Common.styles'
import { Input as InputUI } from '../uielements/input'
import { Label as UILabel } from '../uielements/label'

export const Input = styled(InputUI)`
  border-color: ${palette('gray', 1)};
  max-width: 300px;

  .ant-input {
    color: ${palette('text', 0)};
  }

  .ant-input-prefix svg,
  .anticon-close-circle svg {
    color: ${palette('gray', 1)};
  }

  ${media.md`
  margin: 0 10px 0 10px;
  `}
`

export const Subtitle = styled(UILabel)`
  text-align: center;
  padding: 20px 0 0 20px;
  color: ${palette('text', 0)};
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  font-size: 18px;

  ${media.md`
    text-align: left;
  `}
`

export const WalletCol = styled(A.Col)`
  width: 100%;
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
    background-color: ${palette('background', 1)};

    div > div > div > ul > li {
      border-bottom: 1px solid ${palette('gray', 0)};
    }
  }

  &:last-child {
    margin-bottom: 20px;
  }
`

export const ListItem = styled(A.List.Item)`
  padding: 40px 20px;
  flex-direction: column;
  align-items: start;

  border-bottom: none;
  border-bottom: 1px solid ${palette('gray', 0)};
  .ant-list-item {
    border-bottom: 1px solid ${palette('gray', 0)};
  }
`

export const AccountTitle = styled(UILabel)`
  padding: 0px;
  padding-left: 10px;
  text-transform: uppercase;
  font-weight: normal;
  font-size: 27px;
  line-height: 25px;
  letter-spacing: 2px;
`

const ICON_SIZE = 16

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

export const EthDerivationModeRadioGroup = styled(StyledR.Radio.Group)`
  display: flex;
  align-items: center;
`

export const EthDerivationModeRadioLabel = styled(StyledR.RadioLabel)`
  display: flex;
  align-items: center;
`

export const WalletIndexInput = styled(A.InputNumber)`
  color: ${palette('text', 2)};
  background-color: ${palette('background', 1)};
  margin-left: 10px;
  margin-right: 5px;
  max-width: 45px;
`

export const WalletTypeLabel = styled(WalletTypeLabelUI)`
  margin-left: 40px;
  display: inline-block;
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

export const UnlockWalletButton = styled(UIButton).attrs({
  type: 'primary',
  round: 'true',
  sizevalue: 'xnormal',
  color: 'success'
})`
  min-width: 200px !important;
  padding: 0 30px;
  margin: 30px 0;
`

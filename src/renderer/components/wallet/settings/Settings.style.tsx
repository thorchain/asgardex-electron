import { QrcodeOutlined as QrcodeOutlinedIcon } from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { AddressEllipsis as AddressEllipsisUI } from '../../uielements/addressEllipsis'
import { Button as UIButton } from '../../uielements/button'
import { ExternalLinkIcon as ExternalLinkIconUI } from '../../uielements/common/Common.style'
import { Label as UILabel } from '../../uielements/label'

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
  padding: 10px 30px;
  background-color: ${palette('background', 1)};

  .ant-row {
    margin: 0;
  }
`

export const WalletCol = styled(A.Col)`
  width: 100%;
`

export const Card = styled(A.Card)`
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

export const ExternalLinkIcon = styled(ExternalLinkIconUI)`
  margin-left: 10px;
  color: ${palette('primary', 0)};
  svg {
    color: inherit;
  }
`

export const Placeholder = styled(UILabel)`
  display: block;
  padding: 0px;
  color: ${palette('text', 2)};
  font-family: 'MainFontRegular';
  font-size: 14px;
  text-transform: uppercase;
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
  padding: 10px 20px;
  flex-direction: column;
  align-items: start;
  border: none;
  border-bottom: 1px solid ${palette('gray', 0)};

  .ant-list-item {
    border-bottom: 1px solid ${palette('gray', 0)};
  }
`

export const ChainName = styled(UILabel)`
  padding: 0px;
  text-transform: uppercase;
  font-weight: normal;
  font-size: 18px;
  line-height: 25px;
  letter-spacing: 2px;
`

export const ChainContent = styled.div`
  width: 100%;
  overflow: hidden;
  margin: 0 30px;
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

export const AccountContent = styled(UILabel)`
  display: flex;
  align-items: center;
  padding: 0px;
  color: ${palette('text', 1)};
  background-color: red;
`

export const DeviceText = styled(UILabel)`
  padding: 0 0 10px;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 16px;
  font-family: 'MainFontRegular';

  span {
    margin-right: 10px;
  }
`

export const ActionMenuItem = styled(A.Menu.Item)`
  background-color: ${palette('background', 1)};
  &:hover {
    background-color: ${palette('background', 2)};
  }
`

export const Tooltip = styled(A.Tooltip).attrs({
  placement: 'bottom',
  overlayStyle: {
    wordBreak: 'break-all',
    maxWidth: '500px'
  }
})``

export const AddressContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
`
const ICON_SIZE = 16

export const AddressEllipsis = styled(AddressEllipsisUI)`
  font-size: 16px;
  text-transform: lowercase;
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
  margin-left: 15px;
  height: ${ICON_SIZE}px;
  width: ${ICON_SIZE}px;
  color: ${palette('primary', 0)};
  svg {
    color: inherit;
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const CopyLabel = styled(A.Typography.Text)`
  text-transform: uppercase;
  height: ${ICON_SIZE}px;
  width: ${ICON_SIZE}px;
  font-family: 'MainFontRegular';
  /* icon */
  svg {
    color: inherit;
  }
`

export const QRCodeIcon = styled(QrcodeOutlinedIcon)`
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

export const AddLedger = styled.div`
  display: flex;
  align-items: center;
  margin: 4px 4px 4px 0px;
  color: ${palette('primary', 0)};
  cursor: not-allowed;
`

export const AddLedgerTextWrapper = styled.div`
  margin-left: 5px;
  text-transform: uppercase;
`

import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons'
import * as A from 'antd'
import styled, { css } from 'styled-components'
import { palette } from 'styled-theme'

import { ExternalLinkIcon as ExternalLinkIconUI } from '../../components/uielements/common/Common.style'

const ICON_SIZE = 16

export const EditableFormWrapper = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: -30px;
`

export const AddressFormWrapper = styled('div')`
  margin-top: 0px;
  flex: 7;
`

export const AddressCustomRecipient = styled('div')`
  display: flex;
  flex-direction: row;
  font-size: 16px;
  font-family: 'MainFontRegular';
  text-transform: lowercase;
  color: ${palette('text', 1)};
  max-width: 100%;
  margin-right: 5px;
  overflow: hidden;
  &:only-child {
    margin: auto;
  }
  & svg {
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const AddressEditButtonsWrapper = styled('div')`
  margin-top: -20px;
  flex: 3;
`

export const CopyLabel = styled(A.Typography.Text)`
  margin: 5px 5px 5px -5px;
  margin-left: -5px;
  color: ${palette('primary', 0)};
  svg {
    color: ${palette('primary', 0)};
  }
`

const iconStyles = css`
  margin: 5px;
  height: ${ICON_SIZE}px;
  width: ${ICON_SIZE}px;
  color: ${palette('primary', 0)};
  svg {
    color: inherit;
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const AddressLinkIcon = styled(ExternalLinkIconUI)`
  ${iconStyles}
`

export const EditAddressIcon = styled(EditOutlined)`
  ${iconStyles}
`

export const ConfirmEdit = styled(CheckCircleOutlined)`
  ${iconStyles}
`

export const CancelEdit = styled(CloseCircleOutlined)`
  ${iconStyles}
  color: ${palette('error', 0)};
`

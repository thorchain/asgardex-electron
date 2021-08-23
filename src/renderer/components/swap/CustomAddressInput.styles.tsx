import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ExternalLinkIcon as ExternalLinkIconUI } from '../../components/uielements/common/Common.style'
import { InnerForm } from '../shared/form'

const ICON_SIZE = 16

export const AddressCustomRecipient = styled('div')`
  display: flex;
  flex-direction: row;
  font-size: 16px;
  text-transform: uppercase;
  font-family: 'MainFontRegular';
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

export const Form = styled(InnerForm)`
  padding: 30px;
`

export const CopyLabel = styled(A.Typography.Text)`
  margin: 5px 5px 5px -5px;
  margin-left: -5px;
  text-transform: uppercase;
  color: ${palette('primary', 0)};
  svg {
    color: ${palette('primary', 0)};
  }
`

export const AddressLinkIcon = styled(ExternalLinkIconUI)`
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

export const EditAddressIcon = styled(EditOutlined)`
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

export const ConfirmEdit = styled(CheckCircleOutlined)`
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

export const CancelEdit = styled(CloseCircleOutlined)`
  margin: 5px;
  height: ${ICON_SIZE}px;
  width: ${ICON_SIZE}px;
  color: ${palette('error', 0)};
  svg {
    color: inherit;
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

export const EditableFormWrapper = styled('div')`
  /* display: flex; */
  /* flex-direction: row; */
  /* align-items: center; */
  /* margin-top: 5px; */
  /* margin-right: 50px; */
`

import { CheckCircleTwoTone } from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'

import { ReactComponent as UploadKeystoreIcon } from '../../../assets/svg/icon-upload-keystore.svg'
import { InnerForm } from '../../shared/form/Form.style'

export const Form = styled(InnerForm)`
  width: 100%;
  padding: 30px;
  padding-top: 15px;
  text-align: -webkit-center;
`

export const KeystoreLabel = styled(A.Form.Item)`
  font-family: 'MainFontRegular';
  color: #303942;
  font-size: 16px;
  text-transform: uppercase;
`

export const KeystoreButton = styled.div`
  position: relative;
  max-width: 280px;
  height: 35px;
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  background: #f0fffc;
  border: 1px solid #50e3c2;
  box-sizing: border-box;
  border-radius: 4px;
  color: #50e3c2;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 50px;
`

export const Row = styled(A.Row)`
  margin-bottom: 32px;
`

export const PasswordContainer = styled(A.Row)`
  max-width: 280px;
`
export const PasswordItem = styled(A.Form.Item)`
  width: 100%;
`

export const UploadIcon = styled(UploadKeystoreIcon)`
  margin-right: 10px;
  margin-top: -3px;
`

export const UploadCheckIcon = styled(CheckCircleTwoTone)`
  position: absolute;
  right: 15px;
`

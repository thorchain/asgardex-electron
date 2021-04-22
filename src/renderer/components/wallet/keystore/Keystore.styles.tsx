import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Button } from '../../../components/uielements/button'
import { InnerForm } from '../../shared/form/Form.style'
import { Button as UIButton } from '../../uielements/button'

export const Form = styled(InnerForm)`
  width: 100%;
  padding: 30px;
  padding-top: 15px;
  text-align: -webkit-center;
`

export const KeystoreLabel = styled(A.Form.Item)`
  color: ${palette('text', 0)};
  font-size: 16px;
  text-transform: uppercase;
`

export const KeystoreButton = styled(Button)`
  max-width: 280px;
  height: 35px;
  font-size: 14px;
  cursor: pointer;
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
export const ImportButton = styled(UIButton).attrs({
  size: 'large',
  type: 'primary',
  htmlType: 'submit',
  round: 'true'
})`
  min-width: 150px !important;
  margin-top: 50px;
`

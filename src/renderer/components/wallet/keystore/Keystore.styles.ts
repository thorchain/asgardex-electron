import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Button, Button as UIButton } from '../../../components/uielements/button'
import { InnerForm } from '../../shared/form/Form.styles'
import { Label as UILabel } from '../../uielements/label'

export const Form = styled(InnerForm)`
  width: 100%;
  padding: 30px;
  padding-top: 15px;
  text-align: -webkit-center;
`

export const Title = styled(UILabel).attrs({
  textTransform: 'uppercase',
  align: 'center',
  size: 'big'
})`
  width: 100%;
  margin-bottom: 10px;
`

export const ErrorLabel = styled(UILabel)`
  margin-bottom: 20px;
  text-transform: uppercase;
  color: ${palette('error', 0)};
  text-align: center;
`

export const KeystoreButton = styled(Button).attrs({
  typevalue: 'outline'
})`
  max-width: 100%;
  padding: 5px 10px;
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
export const SubmitButton = styled(UIButton).attrs({
  sizevalue: 'normal',
  type: 'primary',
  htmlType: 'submit',
  round: 'true'
})`
  min-width: 150px !important;
  margin-top: 50px;
`

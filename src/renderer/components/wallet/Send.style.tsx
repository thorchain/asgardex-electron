import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import BaseButton from '../uielements/button'
import Label from '../uielements/label'

export const Col = styled(A.Col)`
  padding: 20px 30px;
  background: ${palette('background', 1)};
`

export const Form = styled(A.Form)`
  padding: 30px;
`

export const SubForm = styled.div`
  max-width: 500px;
`

export const FormItem = styled(A.Form.Item)`
  margin-bottom: 0;
`

export const CustomLabel = styled(Label)`
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  color: ${palette('text', 2)};
`

export const StyledLabel = styled(Label)`
  margin-bottom: 14px;
  font-family: 'MainFontRegular';
  color: ${palette('primary', 0)};
`

export const SubmitItem = styled(A.Form.Item)`
  .ant-form-item-control-input-content {
    display: flex;
    justify-content: flex-end;
  }
`

export const BackLabel = styled(Label)`
  margin-bottom: 18px;
  font-family: 'MainFontRegular';
`

export const Result = styled(A.Result)`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${palette('background', 1)};
`
export const Button = styled(BaseButton).attrs({
  type: 'primary',
  round: 'true',
  sizevalue: 'xnormal'
})``

export const Text = styled('span')`
  color: ${palette('text', 2)};
`

import { Col, Form } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import Label from '../uielements/label'

export const StyledCol = styled(Col)`
  padding: 20px 30px;
  background: ${palette('background', 1)};
`

export const StyledForm = styled(Form)`
  padding: 30px;
`

export const StyledSubForm = styled.div`
  max-width: 500px;
`

export const StyledFormItem = styled(Form.Item)`
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

export const StyledSubmitItem = styled(Form.Item)`
  .ant-form-item-control-input-content {
    display: flex;
    justify-content: flex-end;
  }
`

export const StyledBackLabel = styled(Label)`
  margin-bottom: 18px;
  font-family: 'MainFontRegular';
`

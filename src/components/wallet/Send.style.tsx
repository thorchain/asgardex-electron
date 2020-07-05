import { Col, Form } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import Label from '../../components/uielements/label'

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

export const StyledLabel = styled(Label)`
  margin-bottom: 14px;
`

export const StyledSubmitItem = styled(Form.Item)`
  .ant-form-item-control-input-content {
    display: flex;
    justify-content: flex-end;
  }
`

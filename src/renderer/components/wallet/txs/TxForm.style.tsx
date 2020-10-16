import { SelectOutlined } from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { InnerForm } from '../../shared/form/Form.style'
import { Button as UIButton } from '../../uielements/button/Button'
import { Label as UILabel } from '../../uielements/label'

export const Col = styled(A.Col)`
  padding: 20px 30px;
  background: ${palette('background', 1)};
`

export const Form = styled(InnerForm)`
  padding: 30px;
`

export const SubForm = styled.div`
  max-width: 500px;
`

export const FormItem = styled(A.Form.Item)`
  margin-bottom: 0;
`

export const CustomLabel = styled(UILabel)`
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  color: ${palette('text', 2)};
`

export const Label = styled(UILabel)`
  margin-bottom: 14px;
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  color: ${({ color }) => (color === 'error' ? palette('error', 0) : palette('primary', 0))};
`

export const SubmitItem = styled(A.Form.Item)`
  .ant-form-item-control-input-content {
    display: flex;
    justify-content: flex-end;
  }
`

export const BackLabel = styled(UILabel)`
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
export const Button = styled(UIButton).attrs({
  type: 'primary',
  round: 'true',
  sizevalue: 'xnormal'
})``

export const ButtonLinkIcon = styled(SelectOutlined)`
  svg {
    transform: scale(-1, 1);
  }
`

export const Text = styled('span')`
  color: ${palette('text', 2)};
`

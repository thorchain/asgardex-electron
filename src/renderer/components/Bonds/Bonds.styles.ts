import * as AIcons from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { InnerForm } from '../shared/form'
import { Button as UIButton } from '../uielements/button'
import { Label as UILabel } from '../uielements/label'

export const Container = styled('div')`
  background: ${palette('background', 0)};
`

export const Form = styled(InnerForm)`
  display: flex;
  align-items: center;
  padding-left: 16px;
`

export const InputContainer = styled('div')`
  width: 100%;
  max-width: 630px;
  margin-right: 20px;
`

export const Input = styled(A.Input)`
  background: inherit !important;
  color: ${palette('text', 0)};
`

export const SubmitButton = styled(UIButton).attrs({
  typevalue: 'transparent'
})``

export const AddIcon = styled(AIcons.PlusOutlined)`
  color: ${palette('text', 3)};
  background: ${palette('primary', 0)};
  border-radius: 50%;
  height: 18px;
  width: 18px;
`

export const InputLabel = styled(UILabel)`
  padding: 0;
  font-size: 16px;
  text-transform: uppercase;
  color: ${palette('gray', 2)};
`

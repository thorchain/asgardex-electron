import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import { Button as UIButton } from '../../uielements/button'
import { Label as UILabel } from '../../uielements/label'

export const Form = styled(A.Form)`
  display: flex;
  height: 100%;
  justify-content: space-between;
  flex-direction: column;
`

export const SubmitButtonContainer = styled(Form.Item).attrs({
  shouldUpdate: true
})`
  width: 100%;
  ${media.sm`
    width: auto;
    align-self: flex-end;
  `}
`

export const SubmitButton = styled(UIButton).attrs({
  color: 'primary',
  round: 'true'
})`
  width: 100%;
`

export const InputContainer = styled('div')`
  margin-bottom: 10px;
  ${media.sm`
    margin-bottom: 20px;
    max-width: 500px;
  `}

  &:last-child {
    margin: 0;
  }
`

export const InputLabel = styled(UILabel)`
  padding: 0;
  font-size: 16px;
  text-transform: uppercase;
  color: ${palette('gray', 2)};
`
export const MaxValue = styled(UILabel)`
  font-size: 16px;
  color: ${palette('primary', 0)};
  text-transform: uppercase;
  padding: 0;
`

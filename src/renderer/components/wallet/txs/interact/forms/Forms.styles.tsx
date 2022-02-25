import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../../../helpers/styleHelper'
import { InnerForm } from '../../../../shared/form'
import { Button as UIButton } from '../../../../uielements/button'
import { Label as UILabel } from '../../../../uielements/label'

export const Form = styled(InnerForm)`
  display: flex;
  height: 100%;
  justify-content: space-between;
  flex-direction: column;
`

export const SubmitButtonContainer = styled(A.Form.Item).attrs({
  shouldUpdate: true
})`
  width: 100%;
  margin-top: 30px;

  & .ant-form-item-control-input-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ${media.sm`
    width: auto;
    margin-top: 0px;
    align-self: flex-end;

    & .ant-form-item-control-input-content {
      align-items: flex-end;
    }
  `}
`

export const SubmitButton = styled(UIButton).attrs({
  color: 'primary',
  round: 'true',
  sizevalue: 'xnormal'
})`
  width: auto;

  ${media.sm`
    width: auto;
  `}
`

export const InputContainer = styled('div')`
  margin-bottom: 10px;
  ${media.sm`
    margin-bottom: 20px;
    max-width: 630px;
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

export const LoadingProgress = styled(UILabel)`
  text-align: right;
`

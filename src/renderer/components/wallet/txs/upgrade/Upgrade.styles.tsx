import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ErrorView as UIErrorView } from '../../../shared/error'
import { SuccessView as UISuccessView } from '../../../shared/success'

export const FormWrapper = styled.div`
  min-height: 100%;
  display: flex;
  background-color: ${palette('background', 0)};
`

export const FormContainer = styled.div`
  width: 100%;
`

export const SuccessView = styled(UISuccessView)`
  min-height: 100%;
  display: flex;
  align-items: center;
`

export const ErrorView = styled(UIErrorView)`
  min-height: 100%;
  display: flex;
  align-items: center;
`

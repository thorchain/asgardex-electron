import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ErrorView as UIErrorView } from '../../../shared/error'
import { SuccessView as UISuccessView } from '../../../shared/success'
import { Fees as UIFees } from '../../../uielements/fees'

export const FormWrapper = styled.div`
  padding: 20px 30px;
  display: flex;
  background-color: ${palette('background', 0)};
`

export const FormContainer = styled.div`
  width: 100%;
`

export const SuccessView = styled(UISuccessView)`
  display: flex;
  align-items: center;
`

export const ErrorView = styled(UIErrorView)`
  display: flex;
  align-items: center;
`

export const Fees = styled(UIFees)`
  padding: 20px 0 70px 0;
`

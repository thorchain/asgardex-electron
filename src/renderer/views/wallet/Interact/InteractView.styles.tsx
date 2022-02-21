import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ErrorView as ErrorViewUI } from '../../../components/shared/error'
import { SuccessView as SuccessViewUI } from '../../../components/shared/success'
import { ViewTxButton as ViewTxButtonUI } from '../../../components/uielements/button'

export const ContentContainer = styled('div')`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: auto;
  background-color: ${palette('background', 0)};
`

export const SuccessView = styled(SuccessViewUI)`
  padding: 0;
  & .ant-result-content {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: none;
    padding-top: 0;
  }
`

export const ErrorView = styled(ErrorViewUI)`
  padding: 0;
  & .ant-result-content {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: none;
    padding-top: 0;
  }
`

export const ViewTxButton = styled(ViewTxButtonUI)``

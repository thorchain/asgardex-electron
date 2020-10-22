import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ErrorAlert as UIErrorAlert } from '../../components/uielements/alert'
import { Label as UILabel } from '../../components/uielements/label'
import { media } from '../../helpers/styleHelper'

export const AppWrapper = styled.div`
  height: 100vh;
  background: ${palette('background', 3)};
  padding: 0;

  a {
    transition: none;
  }

  .ant {
    &-btn,
    &-input,
    &-menu,
    &-input-affix-wrapper,
    &-table-thead > tr > th,
    &-table-tbody > tr > td {
      transition: none;
    }
  }
`

export const AppLayout = styled(A.Layout)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background: ${palette('background', 3)};
`

export const ErrorAlert = styled(UIErrorAlert)`
  margin-bottom: 10px;

  ${media.lg`
    margin-bottom: 40px;
  `}
`

export const ErrorDescription = styled(UILabel).attrs({
  textTransform: 'uppercase',
  size: 'normal'
})``

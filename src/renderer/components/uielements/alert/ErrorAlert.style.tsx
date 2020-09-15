import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import Label from '../label'

export const Alert = styled(A.Alert)`
  /* container */
  &.ant-alert-error {
    background-color: ${palette('background', 1)};
    border-color: ${palette('error', 0)};
  }
  /* headline */
  .ant-alert-message {
    text-transform: uppercase;
    color: ${palette('error', 0)};
  }
`

export const Description = styled(Label)`
  color: ${palette('text', 1)};
  padding: 0;
`

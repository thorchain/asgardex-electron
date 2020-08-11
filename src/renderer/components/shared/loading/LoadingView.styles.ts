import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Loading = styled(A.Result)`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${palette('background', 1)};
`

export const Text = styled('span')`
  color: ${palette('text', 2)};
`

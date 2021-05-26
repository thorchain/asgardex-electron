import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Text = styled('span')`
  color: ${palette('text', 2)};
`

export const Space = styled(A.Space).attrs({
  size: 'middle',
  align: 'center'
})`
  height: 100%;
  justify-content: center;
`

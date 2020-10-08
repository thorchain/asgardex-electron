import styled from 'styled-components'
import { palette, key } from 'styled-theme'

import Label from '../label'

export const PoolShareWrapper = styled.div`
  background: ${palette('background', 1)};
  padding: ${key('sizes.gutter.vertical')};
  font-size: 16px;
`

export const ShareLabel = styled(Label).attrs({
  align: 'center',
  size: 'normal',
  colo: 'dark'
})`
  font-weight: bold;
`

export const ShareHeadline = styled(Label).attrs({
  align: 'center',
  size: 'big',
  textTransform: 'uppercase'
})`
  font-weight: bold;
`

import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const EmptyData = styled(A.Empty).attrs({
  image: A.Empty.PRESENTED_IMAGE_SIMPLE
})`
  text-transform: uppercase;
  color: ${palette('text', 0)};
`

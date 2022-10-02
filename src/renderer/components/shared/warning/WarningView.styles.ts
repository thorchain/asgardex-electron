import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Icon as ResultIcon } from '../result/ResultView.styles'

export const Icon = styled(ResultIcon)`
  svg {
    fill: ${palette('warning', 0)};
  }
`

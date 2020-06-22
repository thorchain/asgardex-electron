import styled from 'styled-components'
import { palette } from 'styled-theme'

import { HeaderIconWrapper } from './HeaderIcon.style'

export const HeaderThemeWrapper = styled(HeaderIconWrapper)`
  #theme_switch_icon {
    & > * {
      fill: ${palette('text', 1)};
    }
  }
`

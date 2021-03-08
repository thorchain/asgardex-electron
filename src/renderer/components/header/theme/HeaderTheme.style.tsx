import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ReactComponent as ThemeIconUI } from '../../../assets/svg/icon-theme-switch.svg'
import { HeaderIconWrapper } from '../HeaderIcon.style'

export const HeaderThemeWrapper = styled(HeaderIconWrapper)`
  #theme_switch_icon {
    & > * {
      fill: ${palette('text', 1)};
    }
  }
`

export const ThemeIcon = styled(ThemeIconUI)`
  & path {
    fill: currentColor;
  }
`

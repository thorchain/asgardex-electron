import styled from 'styled-components'

import { ReactComponent as DayThemeIconUI } from '../../../assets/svg/icon-theme-day.svg'
import { ReactComponent as NightThemeIconUI } from '../../../assets/svg/icon-theme-night.svg'
import { HeaderIconWrapper } from '../HeaderIcon.style'

export const HeaderThemeWrapper = styled(HeaderIconWrapper)`
  margin-bottom: 5px;
`

export const DayThemeIcon = styled(DayThemeIconUI)`
  & path {
    fill: currentColor;
  }
`

export const NightThemeIcon = styled(NightThemeIconUI)``

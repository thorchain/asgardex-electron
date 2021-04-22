import Text from 'antd/lib/typography/Text'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ReactComponent as DayThemeIconUI } from '../../../assets/svg/icon-theme-day.svg'
import { ReactComponent as NightThemeIconUI } from '../../../assets/svg/icon-theme-night.svg'
import { HeaderIconWrapper } from '../HeaderIcon.style'

export const HeaderThemeWrapper = styled(HeaderIconWrapper)`
  margin-bottom: 5px;
`

export const DayThemeIcon = styled(DayThemeIconUI)`
  font-size: '1.5em';
  & path {
    fill: ${palette('text', 2)};
  }
`

export const NightThemeIcon = styled(NightThemeIconUI)`
  font-size: '1.5em';
  & path {
    fill: ${palette('text', 0)};
  }
`
export const Label = styled(Text)`
  text-transform: 'upercase';
  color: ${palette('text', 0)};
`

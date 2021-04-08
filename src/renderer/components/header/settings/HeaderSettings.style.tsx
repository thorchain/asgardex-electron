import Text from 'antd/lib/typography/Text'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ReactComponent as SettingsIcon } from '../../../assets/svg/icon-settings.svg'

export const Label = styled(Text)`
  color: ${palette('text', 0)};
`

export const Icon = styled(SettingsIcon)`
  font-size: '1.5em';

  & path {
    fill: ${palette('text', 2)};
  }
`

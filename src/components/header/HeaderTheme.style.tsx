import { Row } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'

export const HeaderThemeWrapper = styled(Row)`
  cursor: pointer;
  justify-content: space-between;
  width: 100vw;
  padding: 0 15px;
  height: 60px;
  align-items: center;

  #theme_switch_icon {
    & > * {
      fill: ${palette('text', 1)};
    }
  }

  ${media.lg`
    width: auto;
    padding: 0;
  `}
`

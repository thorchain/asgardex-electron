import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'

export const HeaderLangWrapper = styled.div`
  width: 100%;

  ${media.lg`
  width: auto;
  padding: 0;
  `}

  /* id defined in svg */
  #down_icon {
    cursor: pointer;
    & > * {
      fill: ${palette('primary', 0)};
    }
  }
`

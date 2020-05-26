import styled from 'styled-components'
import { media } from '../../helpers/styleHelper'
import { palette } from 'styled-theme'

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

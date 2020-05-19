import styled from 'styled-components'
import { palette } from 'styled-theme'

export const HeaderLangWrapper = styled.div`
  /* id defined in svg */
  #down_icon {
    cursor: pointer;
    & > * {
      fill: ${palette('primary', 0)};
    }
  }
`

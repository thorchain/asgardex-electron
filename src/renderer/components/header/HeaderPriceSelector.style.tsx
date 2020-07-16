import styled from 'styled-components'

import { media } from '../../helpers/styleHelper'
import { HeaderDropdownWrapper } from './HeaderMenu.style'

export const HeaderPriceSelectorWrapper = styled(HeaderDropdownWrapper)`
  ${media.lg`
    width: 100px;
  `}
`

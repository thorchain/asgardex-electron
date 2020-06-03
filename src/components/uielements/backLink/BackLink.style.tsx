import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'

export const BackLinkWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px !important;
  ${media.sm`
    margin-bottom: 20px !important;
  `}
  cursor: pointer;

  svg {
    margin-right: 6px;
    font-size: 22px;
    font-weight: bold;
    color: ${palette('primary', 0)};
  }

  span {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: ${palette('primary', 0)};
  }
`

import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'

export const Container = styled('div')`
  display: flex;
  justify-content: center;
  width: 100%;
  color: ${palette('text', 1)};
  padding: 15px 10px 5px 10px;
  text-transform: uppercase;

  ${media.lg`
  padding-top: 5px;
`}
`

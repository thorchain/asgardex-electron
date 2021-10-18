import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'

export const DateContainer = styled.span`
  color: ${palette('text', 0)};
  margin-right: 5px;

  &:last-child {
    margin-right: 0;
  }
`
export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: ${palette('background', 1)};

  ${media.md`
    flex-direction: row;
`}
`

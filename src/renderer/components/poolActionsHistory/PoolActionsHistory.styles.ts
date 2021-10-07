import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { ExternalLinkIcon as ExternalLinkIconUI } from '../uielements/common/Common.styles'
import { Headline as HeadlineUI } from '../uielements/headline'

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

export const HeaderFilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;

  ${media.md`
    flex-direction: row;
`}
`

export const HeaderLinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: cemter;
  padding-top: 20px;
  ${media.md`
  padding-top: 0;
  flex-grow: 1;
  justify-content: right;
`}
`

export const ExplorerLinkIcon = styled(ExternalLinkIconUI)`
  margin-left: 10px;
  svg {
    color: inherit;
  }
`
export const Headline = styled(HeadlineUI)`
  /* TODO (@asgdx-team) Will be enabled with #1811 */
  display: none;
  width: auto;
`

import styled from 'styled-components'

import { media } from '../../helpers/styleHelper'
import { ExternalLinkIcon as ExternalLinkIconUI } from '../uielements/common/Common.styles'
import { Headline as HeadlineUI } from '../uielements/headline'

export const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;

  ${media.md`
    flex-direction: row;
`}
`

export const LinkContainer = styled.div`
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
  width: auto;
`

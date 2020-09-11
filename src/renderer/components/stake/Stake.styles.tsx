import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'

export const Container = styled('div')`
  min-height: 100%;
  display: flex;
  flex-direction: column;
`

export const TopContainer = styled('div')`
  max-width: 100%;
  overflow: auto;
  min-height: 100px;
  margin-bottom: 30px;
`

export const ContentContainer = styled('div')`
  display: flex;
  flex-direction: column;

  ${media.lg`
    flex-direction: row;
    flex: 1;
  `}
`

export const TotalContainer = styled('div')`
  width: 100%;
  background: green;
  margin-bottom: 30px;
  background: ${palette('background', 0)};

  ${media.lg`
    max-width: 430px;
    margin: 0 10px 0 0;
  `};
`

export const StakeContentContainer = styled('div')`
  width: 100%;
  background: ${palette('background', 0)};
`

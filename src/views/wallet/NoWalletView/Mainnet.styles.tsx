import styled from 'styled-components'

import Button from '../../../components/uielements/button'
import { media } from '../../../helpers/styleHelper'

export const ViewContainer = styled('div')`
  min-height: 100%;
  width: 100%;
`

export const ActionContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 50px;

  ${media.md`
    margin-bottom: 140px;
  `}

  &:last-child {
    margin: 0;
  }
`

export const ActionButton = styled(Button)`
  width: 100%;
  max-width: 180px;
  margin-bottom: 10px;
  ${media.md`
    margin-bottom: 30px;
  `}
`

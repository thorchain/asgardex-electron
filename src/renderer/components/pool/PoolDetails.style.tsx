import * as A from 'antd'
import styled from 'styled-components'

import { media } from '../../helpers/styleHelper'

export const Container = styled(A.Row)``

export const Section = styled(A.Row)`
  width: 100%;
  margin-bottom: 10px;

  :nth-last-child(1) {
    margin-bottom: 0px;
  }

  overflow-x: scroll;
`

export const ColumnSpace = styled.div`
  width: 100%;
  margin-top: 10px;

  ${media.lg`
    width: 0px;
    margin-top: 0px;
  `}
`

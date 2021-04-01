import * as A from 'antd'
import styled from 'styled-components'

import { media } from '../../helpers/styleHelper'

const ITEM_GAP = '8px'

export const Container = styled(A.Row)`
  padding-left: ${ITEM_GAP};
  ${media.lg`
    padding: 0;
  `}
`

export const TopContainer = styled(A.Row)`
  width: 100%;
  margin-bottom: 10px;
`

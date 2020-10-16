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

export const Col = styled(A.Col).attrs({
  xs: 12,
  sm: 8,
  lg: 4
})`
  // Need to use paddings instead of margins 'cause
  // of Ant.Col width-value calculation strategy
  padding: 0 ${ITEM_GAP} ${ITEM_GAP} 0;

  ${media.lg`
    &:last-child {
      padding-right: 0;
    }
  `}
`

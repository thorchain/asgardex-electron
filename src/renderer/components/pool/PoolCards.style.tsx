import * as A from 'antd'
import styled from 'styled-components'

const ITEM_GAP = '8px'

export const Container = styled(A.Row)`
  // Needed to compensate extra margin caused by last items of Col
  margin-bottom: -${ITEM_GAP};
`

export const Col = styled(A.Col).attrs({
  span: 12
})`
  // Need to use paddings instead of margins 'cause
  // of Ant.Col width-value calculation strategy
  padding-right: ${ITEM_GAP};
  margin-bottom: ${ITEM_GAP};
`

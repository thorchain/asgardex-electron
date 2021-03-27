import * as A from 'antd'
import styled from 'styled-components'

const ITEM_GAP = '8px'

export const Container = styled(A.Row)``

export const Col = styled(A.Col).attrs({
  span: 12
})`
  // Need to use paddings instead of margins 'cause
  // of Ant.Col width-value calculation strategy
  padding: 0 ${ITEM_GAP} ${ITEM_GAP} 0;
`

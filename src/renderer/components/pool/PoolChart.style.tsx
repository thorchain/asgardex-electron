import * as A from 'antd'
import styled from 'styled-components'

const ITEM_GAP = '8px'

export const Container = styled(A.Row)`
  height: 100%;
  min-height: 200px;
  background: rgb(48, 57, 66);
  padding: 0px ${ITEM_GAP} ${ITEM_GAP} 0px;
  justify-content: center;
  align-items: center;
`

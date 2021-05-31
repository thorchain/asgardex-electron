import * as A from 'antd'
import styled from 'styled-components'

export const Container = styled(A.Row)``

export const Section = styled(A.Row)`
  width: 100%;
  margin-bottom: 10px;

  :nth-last-child(1) {
    margin-bottom: 0px;
  }

  overflow-x: scroll;
`

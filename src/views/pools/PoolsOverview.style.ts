import styled from 'styled-components'

import Label from '../../components/uielements/label'

export const TableAction = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  > :not(:first-child) {
    margin-left: 10px;
  }
`

export const ActionColumn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

export const TimerLabel = styled(Label)`
  display: inline-block;
  width: 100px;
`

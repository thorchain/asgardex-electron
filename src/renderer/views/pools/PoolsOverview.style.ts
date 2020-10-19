import styled from 'styled-components'

import { Label } from '../../components/uielements/label'

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
  align-items: center;
  justify-content: center;
`

export const BlockLeftLabel = styled(Label)`
  display: inline-block;
  width: 100px;
`

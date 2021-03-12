import styled from 'styled-components'

import { Label as LabelUI } from '../label'

export const Container = styled.div`
  display: flex;
  align-items: center;
`

export const Label = styled(LabelUI)`
  margin-right: 10px;
  padding: 0;
  width: auto;
  text-transform: uppercase;
  font-weight: inherit;
`

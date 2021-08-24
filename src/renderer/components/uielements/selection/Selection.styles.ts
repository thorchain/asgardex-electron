import styled from 'styled-components'

import { Button as UIButton } from '../button'

export const SelectionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 200px;
`

export const Button = styled(UIButton).attrs({
  sizevalue: 'small',
  typevalue: 'outline'
})`
  min-width: 45px;
  width: 45px;
  padding: 0px 15px;
`

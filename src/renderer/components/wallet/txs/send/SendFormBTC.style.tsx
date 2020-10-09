import styled from 'styled-components'

import UIButton from '../../../uielements/button'
import { Label } from '../Form.style'

export const FeeLabel = styled(Label)`
  margin-bottom: 0;
  padding-bottom: 0;
`

export const FeeButton = styled(UIButton).attrs({
  typevalue: 'outline'
})`
  &.ant-btn {
    /* overridden */
    min-width: auto;
  }
  width: 30px;
  height: 30px;
  margin-left: 10px;
`

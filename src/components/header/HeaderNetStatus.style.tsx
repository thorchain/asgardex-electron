import { Row } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const HeaderNetStatusWrapper = styled(Row)`
  margin-bottom: 5px;
  /* id defined in svg */
  #down_icon {
    cursor: pointer;
    & > * {
      fill: ${palette('primary', 0)};
    }
  }
`

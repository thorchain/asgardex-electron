import styled from 'styled-components'
import { palette } from 'styled-theme'
import { media } from '../../helpers/styleHelper'
import { Row } from 'antd'

export const HeaderNetStatusWrapper = styled(Row)`
  margin-bottom: 5px;
  /* id defined in svg */
  #down_icon {
    cursor: pointer;
    & > * {
      fill: ${palette('primary', 0)};
    }
  }

  width: 100%;
  ${media.lg`
  width: auto;
    `}
`

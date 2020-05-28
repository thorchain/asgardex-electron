import { Row } from 'antd'
import styled from 'styled-components'

import { media } from '../../helpers/styleHelper'

export const HeaderSettingsWrapper = styled(Row)`
  cursor: pointer;
  justify-content: space-between;
  width: 100vw;
  padding: 0 15px;
  height: 60px;
  align-items: center;

  ${media.lg`
    width: auto;
    padding: 0;
  `}
`

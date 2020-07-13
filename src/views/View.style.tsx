import { Layout } from 'antd'
import styled from 'styled-components'

import { media } from '../helpers/styleHelper'

export const ViewWrapper = styled(Layout.Content)`
  overflow: auto;
  padding: 10px;

  ${media.md`
    padding: 20px;
  `}

  ${media.lg`
    padding: 70px 25px;
  `}
`

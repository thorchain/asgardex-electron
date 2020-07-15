import { Layout } from 'antd'
import styled from 'styled-components'

import { media } from '../helpers/styleHelper'

export const ViewWrapper = styled(Layout.Content)`
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 20px 10px;

  ${media.md`
    padding: 20px;
  `}

  ${media.lg`
    padding: 70px 50px;
  `}
`

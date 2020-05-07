import styled from 'styled-components'
import { Layout } from 'antd'
import { palette } from 'styled-theme'

export const FooterWrapper = styled(Layout.Footer)`
  text-align: center;
  background-color: ${palette('background', 0)};
  color: ${palette('text', 0)};
`

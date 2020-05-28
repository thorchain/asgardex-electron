import { Layout } from 'antd'
import styled from 'styled-components'
import { size } from 'styled-theme'

export const ViewWrapper = styled(Layout.Content)`
  padding: 70px 50px;
  width: 100vw;
  margin-top: ${size('headerHeight')};
  margin-bottom: ${size('footerHeight')};
  min-height: calc(100vh - ${size('headerHeight')} - ${size('footerHeight')});
`

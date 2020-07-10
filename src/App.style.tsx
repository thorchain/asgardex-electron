import { Layout } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export type Space = 'no' | 'wide'

export type AppWrapperProps = {
  space?: Space
}

export const AppWrapper = styled.div<AppWrapperProps>`
  height: 100vh;
  background: ${palette('background', 3)};
  padding: ${(props) => (props?.space === 'wide' ? '10px' : '0')};

  a {
    transition: none;
  }

  .ant {
    &-btn,
    &-input,
    &-menu,
    &-input-affix-wrapper,
    &-table-thead > tr > th,
    &-table-tbody > tr > td {
      transition: none;
    }
  }
`

export const AppLayout = styled(Layout)`
  background: ${palette('background', 3)};
`

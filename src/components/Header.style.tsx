import styled from 'styled-components'
import { Layout } from 'antd'
import { palette } from 'styled-theme'

export const HeaderWrapper = styled(Layout.Header)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: ${palette('background', 0)};

  .select-locale {
    margin-right: 20px;
  }
`

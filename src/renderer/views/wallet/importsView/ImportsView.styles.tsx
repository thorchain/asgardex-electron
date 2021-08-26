import styled from 'styled-components'
import { palette } from 'styled-theme'

export const ImportsViewWrapper = styled.div`
  flex: 1;

  .ant-tabs-nav {
    &::before {
      border-bottom-color: ${palette('background', 2)};
    }
  }

  .ant-tabs-nav-wrap {
    justify-content: center;
  }

  .ant-tabs-ink-bar {
    height: 5px;
    background: ${palette('gradient', 0)};
  }
`

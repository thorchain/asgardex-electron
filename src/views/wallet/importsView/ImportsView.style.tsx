import styled from 'styled-components'
import { palette } from 'styled-theme'

import Label from '../../../components/uielements/label'

export const ImportsViewWrapper = styled.div`
  flex: 1;

  .ant-tabs {
    margin-top: 20px;
  }

  .ant-tabs-nav-wrap {
    justify-content: center;
  }

  .ant-tabs-ink-bar {
    height: 5px;
    background: ${palette('gradient', 0)};
  }
`

export const TabLabel = styled(Label)`
  color: ${palette('black', 1)};
  padding: 0;
  padding-left: 20px;
  padding-right: 20px;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  text-transform: uppercase;
`

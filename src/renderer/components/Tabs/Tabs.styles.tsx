import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import Label from '../uielements/label'

export const Tabs = styled(A.Tabs).attrs({
  size: 'large'
})`
  min-height: 100%;
  padding-top: 20px;
  background-color: ${palette('background', 1)};

  .ant-tabs-content-holder {
    overflow: auto;
  }

  .ant-tabs-ink-bar {
    height: 5px;
    background: ${palette('gradient', 0)};
  }

  .ant-tabs-content {
    min-height: 100%;
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

export const ContentWrapper = styled('div')<{ centerContent?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: ${(props) => (props.centerContent ? 'center' : '')};
  align-items: ${(props) => (props.centerContent ? 'center' : '')};
  padding: 40px;
  min-height: 100%;
`

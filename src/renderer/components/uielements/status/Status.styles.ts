import styled from 'styled-components'

import { Label } from '../label'

export type StatusDirection = 'horizontal' | 'vertical'

type StatusWrapperProps = {
  direction: StatusDirection
}
export const StatusWrapper = styled.div<StatusWrapperProps>`
  display: flex;
  flex-direction: ${(props) => (props.direction === 'horizontal' ? 'row' : 'column')};
  text-transform: uppercase;
  letter-spacing: 1px;

  .status-title {
    padding: 11px 0;
    ${(props) => (props.direction === 'horizontal' ? 'padding-right: 4px' : 'padding-bottom: 4px')};
  }
  .status-value {
    ${(props) => (props.direction === 'horizontal' ? 'padding-left: 4px' : 'padding-top: 4px')};
    font-size: 13px;
    text-transform: uppercase;
  }
`

export const NoWrapLabel = styled(Label)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

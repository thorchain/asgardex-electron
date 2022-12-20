import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label } from '../label'

export const PoolStatusWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  padding: 8px 12px 8px 16px;
  background: ${palette('background', 1)};
  box-shadow: 0px 1px 3px ${palette('gray', 0)};
  border-radius: 3px;
  height: 70px;

  &:before {
    content: '';
    position: absolute;
    width: 3px;
    height: 100%;
    left: 0px;
    top: 0px;
    border-bottom-left-radius: 3px;
    border-top-left-radius: 3px;
    background: ${palette('success', 0)};
  }

  .label-wrapper {
    padding: 0;
  }
`

export const Title = styled(Label).attrs({
  size: 'big'
})`
  text-transform: uppercase;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: default;
`

export const Value = styled(Label).attrs({
  weight: 'bold',
  size: 'big'
})`
  text-transform: uppercase;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: default;
  width: fit-content;
  min-width: 100%;
`

export const Tooltip = styled(A.Tooltip).attrs({
  placement: 'bottom',
  overlayStyle: {
    wordBreak: 'break-all',
    textTransform: 'uppercase'
  }
})``

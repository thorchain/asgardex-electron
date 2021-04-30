import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Alert as AlertUI } from '../uielements/alert'
import { Button as ButtonUI } from '../uielements/button'

export const Alert = styled(AlertUI).attrs({
  type: 'success'
})`
  .anticon-close {
    color: ${palette('text', 0)};
  }

  .ant-alert-close-icon {
    align-self: flex-start;
  }
`

export const Title = styled.span`
  line-height: 1rem;

  &:not(:only-child) {
    margin-bottom: 5px;
  }
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`

export const OkButton = styled(ButtonUI).attrs({
  size: 'small',
  type: 'primary'
})``

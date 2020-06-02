import { Input } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const CoinInputAdvancedView = styled(Input)`
  width: 100%;
  /* TODO: move these styles to a uielement */
  background: ${palette('background', 1)};
  color: ${palette('text', 0)};
  &.ant-input {
    border: none;
    padding: 0;
    &:focus {
      outline: none;
      border: none;
      box-shadow: none;
    }
  }
  &.ant-input.ant-input-disabled {
    background-color: ${palette('background', 1)};
    color: ${palette('text', 0)};
  }
`

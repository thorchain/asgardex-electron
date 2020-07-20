import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Card = styled(A.Card)`
  border-color: ${palette('primary', 0)};
`

export const Button = styled(A.Button)<{ readOnly?: boolean }>`
  font-weight: bold;
  cursor: ${(props) => (props?.readOnly ? 'default' : 'pointer')};

  &:hover,
  &:active,
  &:focus {
    background: ${(props) => (props?.readOnly ? 'none' : palette('gray', 0))};
  }
`

export const Row = styled(A.Row)`
  margin-bottom: 32px;
`

import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Container = styled.div``

export const AddressContainer = styled.div`
  display: flex;
  word-break: keep-all;
  overflow-wrap: normal;
`

export const Address = styled.span``

export const CopyLabel = styled(A.Typography.Text)`
  text-transform: uppercase;
  color: ${palette('primary', 0)};
  svg {
    color: ${palette('primary', 0)};
  }
`

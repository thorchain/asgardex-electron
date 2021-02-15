import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Container = styled.div``

export const AddressContainer = styled.div`
  display: flex;
  align-items: center;
  word-break: keep-all;
  overflow-wrap: normal;
`

export const Address = styled.span`
  color: ${palette('text', 2)};
`

export const CopyLabel = styled(A.Typography.Text)`
  text-transform: uppercase;
  color: ${palette('primary', 0)};

  & .ant-typography-copy {
    display: flex !important;
  }

  svg {
    color: ${palette('primary', 0)};
  }
`

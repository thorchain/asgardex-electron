import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const CopyLabel = styled(A.Typography.Text)`
  display: flex;
  place-items: center;
  &,
  .ant-typography-copy {
    text-transform: uppercase;
    font-family: 'MainFontRegular';
    color: ${palette('primary', 0)} !important;
  }
  svg {
    margin-left: 5px;
  }
`

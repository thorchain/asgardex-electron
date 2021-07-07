import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Spin = styled(A.Spin)`
  & .ant-spin-text {
    color: ${palette('gray', 2)};
    font-size: 12px;
    text-transform: uppercase;
    font-family: 'MainFontRegular';
  }
`

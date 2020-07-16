import { Typography } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import UITable from '../uielements/table'

export const Table = styled(UITable)`
  .ant-table-thead > tr > th {
    font-size: 16px;
    font-weight: 600;
    line-height: 19px;
    font-family: 'MainFontRegular';
    border: none;
    color: ${palette('gray', 2)};
  }

  .ant-table-tbody > tr > td {
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;
    font-family: 'MainFontRegular';
    border: none;

    span {
      display: inline-block;
      text-overflow: ellipsis;
      max-width: 200px;
      overflow: hidden;
      white-space: nowrap;
    }
  }
`

export const Text = styled(Typography.Text)`
  text-transform: uppercase;
  font-weight: 600;
  color: ${palette('text', 1)};
`

export const Link = styled(Typography.Text)`
  font-weight: 600;
  text-transform: uppercase;
  color: ${palette('primary', 0)};
`

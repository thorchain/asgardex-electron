import { SelectOutlined } from '@ant-design/icons'
import { Typography } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import UITable from '../uielements/table'

export const Table = styled(UITable)`
  .ant-table-thead > tr > th {
    font-size: 16px;
    font-family: 'MainFontRegular';
    border: none;
    color: ${palette('gray', 2)};
  }

  .ant-table-tbody > tr > td {
    border: none;
  }
`

export const Text = styled(Typography.Text)`
  font-size: 16px;
  text-transform: uppercase;
  font-family: 'MainFontRegular';
  color: ${palette('text', 1)};
`

export const LinkIcon = styled(SelectOutlined)`
  transform: scale(-1, 1);
  color: ${palette('text', 1)};
`

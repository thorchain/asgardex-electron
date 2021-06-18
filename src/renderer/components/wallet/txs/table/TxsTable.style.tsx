import { SwapOutlined } from '@ant-design/icons'
import { Typography } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Table as UITable } from '../../../uielements/table'
import { TxType as TxTypeUI } from '../../../uielements/txType'

export const Table = styled(UITable)`
  .ant-table-thead > tr > th {
    font-size: 14px;
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
  text-transform: none;
  font-family: 'MainFontRegular';
  color: ${palette('text', 1)};
`

export const TransferIcon = styled(SwapOutlined)`
  svg {
    height: 20px;
    width: 20px;
    color: ${palette('primary', 0)};
  }
`

export const OwnText = styled.div`
  text-transform: uppercase;
  color: inherit;
`

export const TxType = styled(TxTypeUI)`
  & .label-wrapper {
    display: none;
  }
`

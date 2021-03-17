import { Typography } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { Table as UITable } from '../uielements/table'
import { TxType as TxTypeUI } from '../uielements/txType'

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

  // .ant-table-row:hover {
  //   & .ant-table-cell {
  //     background: ${palette('gray', 1)} !important;
  //   }
  // }
`

export const Text = styled(Typography.Text)`
  font-size: 16px;
  text-transform: lowercase;
  font-family: 'MainFontRegular';
  color: ${palette('text', 1)};
`

export const TxType = styled(TxTypeUI)`
  & .label-wrapper {
    display: none;
  }

  ${media.lg`
    justify-content: flex-end;
    & .label-wrapper {
      display: initial;
    }
  `}
`

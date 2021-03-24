import { Typography } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { Table as UITable } from '../uielements/table'
import { TxType as TxTypeUI } from '../uielements/txType'
import { PoolActionsHistoryFilter } from './PoolActionsHistoryFilter'

export const Table = styled(UITable)`
  .ant-table-thead > tr {
    & > th {
      font-size: 14px;
      font-family: 'MainFontRegular';
      color: ${palette('text', 0)};
      font-weight: 600;
      &,
      &:hover {
        background: ${palette('background', 0)} !important;
      }
    }
  }
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
    & .label-wrapper {
      display: initial;
    }
  `}
`

export const ActionsFilter = styled(PoolActionsHistoryFilter)`
  &.ant-btn {
    display: inline-block;
  }
`

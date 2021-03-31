import * as AIcons from '@ant-design/icons/lib'
import * as A from 'antd'
import { ListProps } from 'antd/lib/list'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { PoolAction } from '../../services/midgard/types'
import { Button as UIButton } from '../uielements/button'
import { TxType as TxTypeUI } from '../uielements/txType'
import { PoolActionsHistoryFilter } from './PoolActionsHistoryFilter'

export const ActionsFilter = styled(PoolActionsHistoryFilter)`
  align-self: flex-end;
  margin-right: 20px;
  margin-bottom: 10px;
`

export const List = styled(A.List)`
  background: ${palette('background', 0)};
  color: ${palette('text', 0)};
` as React.FC<ListProps<PoolAction>>

export const ListItem = styled(A.List.Item)`
  &:last-item {
    margin: 0;
  }

  &.ant-list-item {
    padding: 0;
    border: 0;
    border-color: ${palette('gray', 1)};
    border-bottom: 1px solid ${palette('gray', 1)};
  }
`

export const Card = styled(A.Card)`
  & {
    &.ant-card {
      border: none;
    }

    .ant-card-head {
      min-height: 0;
      border: none;
    }

    .ant-card-head-title,
    .ant-card-extra {
      padding: 0;
    }

    .ant-card-head,
    .ant-card-body {
      padding: 0px;
    }

    .ant-card-body {
      padding-bottom: 0;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
`

export const TxType = styled(TxTypeUI)`
  margin-right: 10px;
`

export const InfoArrow = styled(AIcons.ArrowUpOutlined)`
  transform: rotateZ(45deg);
  color: ${palette('primary', 0)};
`

export const GoToButton = styled(UIButton).attrs({ typevalue: 'transparent' })`
  &.ant-btn {
    display: inline-block;
    min-width: 0;
    padding: 0;
  }
`

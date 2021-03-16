import * as AIcons from '@ant-design/icons/lib'
import * as A from 'antd'
import { ListProps } from 'antd/lib/list'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { HistoryAction } from '../../services/midgard/types'
import { Button as UIButton } from '../uielements/button'
import { TxType as TxTypeUI } from '../uielements/txType'

export const List = styled(A.List)`
  background: ${palette('background', 0)};
  color: ${palette('text', 0)};
` as React.FC<ListProps<HistoryAction>>

export const ListItem = styled(A.List.Item)`
  margin-bottom: 10px;

  &:last-item {
    margin: 0;
  }

  &.ant-list-item {
    padding: 0;
    border: 0;
  }
`

export const Card = styled(A.Card)`
  & {
    &.ant-card {
      border-color: ${palette('gray', 1)};
    }

    .ant-card-head {
      min-height: 0;
      border-color: ${palette('gray', 1)};
    }

    .ant-card-head-title,
    .ant-card-extra {
      padding: 0;
    }

    .ant-card-head,
    .ant-card-body {
      padding: 5px;
    }

    .ant-card-body {
      padding-bottom: 0;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }

    ${media.md`
      .ant-card-head, .ant-card-body {
        padding: 10px;
      } 
      .ant-card-body {
        padding-bottom: 5px;
      }
    `}
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

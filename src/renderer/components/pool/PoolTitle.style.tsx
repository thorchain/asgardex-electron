import * as A from 'antd'
import styled from 'styled-components'

import { media } from '../../helpers/styleHelper'
import { Label } from '../uielements/label'

const ITEM_GAP = '8px'

export const Container = styled(A.Row)`
  justify-content: space-between;
  flex-flow: row;
  width: 100%;
`

export const Title = styled(Label).attrs({
  weight: 'bold',
  size: 'big'
})`
  display: flex;
  margin-right: ${ITEM_GAP};
  width: fit-content;
  place-items: center;
  text-transform: uppercase;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 16px;
  ${media.lg`
    font-size: 18px;
  `}
`

export const Price = styled(Label).attrs({
  weight: 'bold',
  size: 'big'
})`
  display: flex;
  width: fit-content;
  place-items: center;
  text-transform: uppercase;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 18px;
  ${media.lg`
    font-size: 24px;
  `}
`

export const RowItem = styled(A.Col)`
  display: flex;
  flex-direction: row;
  width: fit-content;
`

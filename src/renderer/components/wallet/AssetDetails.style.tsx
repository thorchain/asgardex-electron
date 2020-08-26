import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import Headline from '../uielements/headline'
import UILabel from '../uielements/label'

export const Divider = styled(A.Divider)`
  margin: 0px;
  border-top: 1px solid ${palette('gray', 0)};
`

export const Label = styled(UILabel).attrs({
  textTransform: 'uppercase',
  align: 'center',
  color: 'primary',
  size: 'big'
})`
  cursor: pointer;
`

export const ActionRow = styled(A.Row)`
  width: 100%;
  padding-top: 30px;
  background-color: ${palette('background', 1)};
`

export const ActionCol = styled(A.Col)`
  width: 100%;
  display: flex;
  padding-bottom: 30px;
  justify-content: center;
  align-items: flex-start;
`

export const ActionWrapper = styled.div`
  width: 100%;
`

type TableHeadlineProps = {
  isDesktop: boolean
}

export const TableHeadline = styled(Headline)`
  padding: 40px 0 20px 0;
  width: 100%;
  text-align: ${({ isDesktop }: TableHeadlineProps) => (isDesktop ? 'left' : 'center')};
`

import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'
import { ExternalLinkIcon as ExternalLinkIconUI } from '../../uielements/common/Common.styles'
import { Label as UILabel } from '../../uielements/label'

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
export const FeeRow = styled(A.Row).attrs({
  justify: 'center',
  align: 'middle'
})`
  width: 100%;
  padding-top: 10px;
`

export const TableHeadlineLinkIcon = styled(ExternalLinkIconUI)`
  margin-left: 10px;
  svg {
    color: inherit;
  }
`

export const UpgradeFeeErrorLabel = styled(UILabel).attrs({
  color: 'error',
  textTransform: 'uppercase',
  align: 'center'
})`
  padding: 10px 50px 0 50px;

  ${media.md`
      padding: 10px 0 0 0;
  `};
`

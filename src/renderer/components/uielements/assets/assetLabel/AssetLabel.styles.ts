import { Row, Col as ACol } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../../label'

export type AssetLabelSize = 'small' | 'big'

export const Wrapper = styled(Row).attrs({
  align: 'middle'
})`
  padding: 5px 0px;
  margin-right: 8px;

  &:last-child {
    margin: 0;
  }
`

export const TickerLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  weight: 'bold'
})`
  height: 18px;
  padding: 0px 16px 0px 11px;
  font-size: 16px;
  line-height: 18px;
`

export const ChainLabel = styled(TickerLabel)`
  color: ${palette('gray', 2)};
  font-size: 12px;
  font-weight: 500;
`

export const Col = styled(ACol)`
  margin-right: 8px;

  &:last-child {
    margin: 0;
  }
`

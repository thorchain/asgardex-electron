import { Row, Col as ACol } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../../label'
import { AssetIcon as UIAssetIcon } from '../assetIcon'

export type AssetDataSize = 'small' | 'big'

export const Wrapper = styled(Row).attrs({
  align: 'middle'
})`
  padding: 5px 0px;
  margin-right: 8px;

  &:last-child {
    margin: 0;
  }
`

export const AssetIcon = styled(UIAssetIcon)``

export const TickerLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  weight: '600'
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

export const AmountLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  weight: '600'
})`
  font-family: 'MainFontRegular';
  padding-left: 10px;
`

export const PriceLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  weight: 'normal',
  color: 'light'
})`
  padding-left: 10px;
  font-family: 'MainFontRegular';
`

export const Col = styled(ACol)`
  margin-right: 8px;

  &:last-child {
    margin: 0;
  }
`

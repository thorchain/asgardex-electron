import { Row } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label as UILabel } from '../../label'
import { AssetIcon as UIAssetIcon } from '../assetIcon'

export type AssetDataSize = 'small' | 'big'

export const Wrapper = styled(Row).attrs({
  align: 'middle'
})`
  padding: 5px 0px;
`

export const AssetIcon = styled(UIAssetIcon)``

export const TickerLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  weight: '600'
})`
  height: 18px;
  padding: 0px 16px;
  font-size: 14px;
  line-height: 18px;
  &.small {
    color: ${palette('gray', 2)};
    font-size: 10px;
    font-weight: 500;
  }
`

export const AmountLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  weight: '600'
})`
  padding-left: 10px;
`

export const PriceLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  weight: 'normal',
  color: 'light'
})`
  padding-left: 10px;
`

import { Row } from 'antd'
import styled from 'styled-components'

import { Label as UILabel } from '../../label'
import { AssetIcon as UIAssetIcon } from '../assetIcon'

export type AssetDataSize = 'small' | 'big'

export const Wrapper = styled(Row).attrs({
  align: 'middle'
})``

export const AssetIcon = styled(UIAssetIcon)``

export const TickerLabel = styled(UILabel).attrs({
  textTransform: 'uppercase',
  weight: '600'
})`
  padding-left: 10px;
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

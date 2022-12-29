import { Row } from 'antd'
import styled from 'styled-components'

import { AssetCard as UIAssetCard } from '../../uielements/assets/assetCard'

export const CardsRow = styled(Row).attrs({
  justify: 'center',
  align: 'top'
})`
  width: 100%;
  padding-top: 50px;
`

export const AssetCard = styled(UIAssetCard)`
  width: 100%;
`

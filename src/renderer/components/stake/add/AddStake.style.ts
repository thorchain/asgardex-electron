import { Col, Row } from 'antd'
import styled from 'styled-components'

import { AssetCard as BaseAssetCard } from '../../uielements/assets/assetCard'
import { Button as UIButton } from '../../uielements/button'
import { Label as UILabel } from '../../uielements/label'

export const Container = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 100%;
`

export const CardsRow = styled(Row).attrs({
  justify: 'center',
  align: 'top'
})`
  width: 100%;
`

export const CardCol = styled(Col)`
  padding-bottom: 20px;
  &:last-child {
    padding-bottom: 0;
  }
`
export const AssetCard = styled(BaseAssetCard)`
  width: 100%;
`

export const DragWrapper = styled('div')`
  padding: 20px;
`

export const FeeLabel = styled(UILabel).attrs({
  size: 'normal'
})`
  padding: 0;
`
export const ReloadFeeButton = styled(UIButton).attrs({
  typevalue: 'outline'
})`
  &.ant-btn {
    /* overridden */
    min-width: auto;
  }
  width: 30px;
  height: 30px;
  margin-right: 10px;
`

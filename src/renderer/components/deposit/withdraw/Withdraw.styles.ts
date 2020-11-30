import styled from 'styled-components'

import { AssetIcon as AssetIconBase } from '../../uielements/assets/assetIcon'
import { Drag as BaseDrag } from '../../uielements/drag'
import { Label as UILabel } from '../../uielements/label'
import { Slider as BaseSlider } from '../../uielements/slider'

export const Container = styled('div')`
  .sliderLabel {
    font-size: 18px;
  }
`

export const AssetContainer = styled('div')`
  display: flex;
  flex-direction: row;
  height: 32px;
  margin-bottom: 20px;

  &:last-child {
    margin: 0;
  }
`

export const AssetIcon = styled(AssetIconBase).attrs({ size: 'small' })`
  margin-right: 10px;
`

export const Slider = styled(BaseSlider).attrs({
  useMiddleLabel: true,
  tooltipPlacement: 'bottom',
  withLabel: true,
  labelPosition: 'top'
})``

export const Drag = styled(BaseDrag)`
  display: flex;
  justify-content: center;
`

export const OutputLabel = styled(UILabel).attrs({
  weight: 'bold'
})`
  padding-left: 10px;
`

import { Row } from 'antd'
import styled from 'styled-components'

import { media } from '../../../helpers/styleHelper'
import { AssetIcon as AssetIconBase } from '../../uielements/assets/assetIcon'
import { AssetLabel as AssetLabelUI } from '../../uielements/assets/assetLabel'
import { ViewTxButton as UIViewTxButton } from '../../uielements/button'
import { Button as UIButton } from '../../uielements/button'
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

  > div:first-child {
    margin-right: 10px;
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
  padding: 8px 0px 8px 10px;
`
export const FeesRow = styled(Row)`
  width: 100%;
`

export const FeeRow = styled(Row).attrs({
  align: 'middle'
})`
  padding-bottom: 20px;

  ${media.xl`
    padding-bottom: 0px;
`}
`

export const FeeErrorRow = styled(Row).attrs({
  align: 'middle'
})`
  padding-bottom: 20px;

  ${media.xl`
    padding-top: 20px;
    padding-bottom: 0px;
`}
`

export const FeeErrorLabel = styled(UILabel).attrs({
  color: 'error',
  textTransform: 'uppercase'
})`
  font-family: 'MainFontRegular';
  padding: 0;
  margin-bottom: 10px;
`

export const ExtraContainer = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
`

export const ViewTxButtonTop = styled(UIViewTxButton)`
  padding-bottom: 20px;
`

export const AssetLabel = styled(AssetLabelUI)`
  padding: 0px;
`

export const SubmitButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
`

export const SubmitButton = styled(UIButton).attrs({
  type: 'primary',
  round: 'true'
})`
  min-width: 200px !important;
  margin-bottom: 30px;
  padding-left: 30px;
  padding-right: 30px;
`

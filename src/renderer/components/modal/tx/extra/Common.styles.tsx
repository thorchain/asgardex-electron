import styled from 'styled-components'

import { AssetData as UIAssetData } from '../../../uielements/assets/assetData'
import { Label as UILabel } from '../../../uielements/label'
import { StepBar as UIStepBar } from '../../../uielements/stepBar'

export const StepLabel = styled(UILabel).attrs({
  size: 'small',
  color: 'gray'
})`
  width: 100%;
  padding-bottom: 20px;
  font-family: 'MainFontRegular';
  text-align: center;
  text-transform: uppercase;
`

export const DataWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

export const StepBar = styled(UIStepBar)`
  justify-content: center;
`

export const AssetsContainer = styled.div`
  padding: 0 20px;
  display: flex;
  flex-direction: column;
`

export const AssetData = styled(UIAssetData)`
  margin-bottom: 20px;
  &:last-child {
    margin: 0;
  }
`

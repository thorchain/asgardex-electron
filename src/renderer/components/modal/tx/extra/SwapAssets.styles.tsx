import React from 'react'

import styled from 'styled-components'

import { AssetData as UIAssetData, Props as AssetDataProps } from '../../../uielements/assets/assetData'
import { Label as UILabel } from '../../../uielements/label'

export const StepLabel = styled(UILabel).attrs({
  size: 'small',
  color: 'gray',
  textAlign: 'center'
})`
  width: 100%;
  padding-bottom: 20px;
  font-family: 'MainFontRegular';
  text-transform: uppercase;
  text-align: center;
`

export const DataWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

export const StepBarContainer = styled.div`
  display: flex;
  align-items: center;
`

export const AssetsContainer = styled.div`
  padding: 0 20px;
  display: flex;
  flex-direction: column;
`
const AssetDataContainer = styled.div`
  margin-bottom: 10px;

  &:last-child {
    margin: 0;
  }
`

export const AssetData = styled((props: AssetDataProps) => (
  <AssetDataContainer>
    <UIAssetData {...props} />
  </AssetDataContainer>
))``

export const TrendContainer = styled.div`
  padding-top: 20px;
  width: 100%;
  display: flex;
  justify-content: center;
`

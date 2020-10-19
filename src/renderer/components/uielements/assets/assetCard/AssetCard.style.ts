import styled from 'styled-components'
import { palette } from 'styled-theme'

import { InputBigNumber as BaseInputBigNumber } from '../../input'
import { Label } from '../../label'
import { AssetSelect as BaseAssetSelect } from '../assetSelect'

const CONTAINER_SIDE_PADDING = 16

export const AssetCardWrapper = styled.div`
  width: 100%;
  .title-label {
    font-style: italic;
  }

  .selection-wrapper {
    width: auto;
    margin-top: 10px;

    .btn-wrapper {
      width: 20%;
    }
  }
`

export const CardBorderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;

  border: 1px solid ${palette('gray', 0)};
  border-radius: 3px;
  background-color: ${palette('background', 1)};

  & .coinData-wrapper {
    width: auto;
  }
`

export const CardTopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-width: 250px;
  padding: 40px 0;
`

export const AssetCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const AssetNameLabel = styled(Label).attrs({
  size: 'normal',
  weight: 'bold'
})`
  font-size: 16px;
  letter-spacing: 0.75px;
  transition: transform 0.2s ease-in-out;
  text-transform: uppercase;
  border-bottom: 1px solid ${palette('gray', 0)};
  padding: 9px ${CONTAINER_SIDE_PADDING}px;
`

export const AssetData = styled.div.attrs({ className: 'asset-data' })`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-right: 5px;
`

export const FooterLabel = styled(Label).attrs({
  size: 'normal',
  color: 'light',
  weight: 'normal'
})`
  letter-spacing: 0.4px;
  padding: 0;
`

export const AssetSelect = styled(BaseAssetSelect)`
  width: 100%;

  // we have to set padding to the children 'cause of ant
  // calculates position based on parent's box-model
  > * {
    &:first-child {
      padding-left: ${CONTAINER_SIDE_PADDING}px;
    }

    &:last-child {
      padding-right: ${CONTAINER_SIDE_PADDING}px;
    }
  }
`

export const InputBigNumber = styled(BaseInputBigNumber)`
  font-size: 18px;
  padding: 0;
  margin-bottom: 5px;
  box-shadow: none !important;
  border-top: none;
  border-left: none;
  border-right: none;
`

export const SliderWrapper = styled.div`
  padding: 0 5px 20px 10px;
`

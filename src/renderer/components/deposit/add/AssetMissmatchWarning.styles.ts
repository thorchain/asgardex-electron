import styled from 'styled-components'

import { AssetAddress as UIAssetAddress } from '../../uielements/assets/assetAddress'

export const AssetAddress = styled(UIAssetAddress)`
  padding-top: 10px;
  &:first-child {
    padding-top: 0px;
  }
`

export const AssetWarningAssetContainer = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: center;
  height: 32px;
  margin: 10px 0;

  &:last-child {
    margin: 0;
  }

  > div:first-child {
    margin-right: 10px;
  }
`

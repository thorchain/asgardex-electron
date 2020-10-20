import styled from 'styled-components'
import AssetIconBase from '../../uielements/assets/assetIcon'

export const Container = styled('div')``

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

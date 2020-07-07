import styled from 'styled-components'
import { palette } from 'styled-theme'

export type AssetSelectDataWrapperSize = 'small' | 'big'
export type AssetSelectDataWrapperType = 'wallet' | 'normal'

type AssetSelectDataWrapperProps = {
  size: AssetSelectDataWrapperSize
  type: AssetSelectDataWrapperType
  hasTarget?: boolean
}

export const AssetSelectDataWrapper = styled.div<AssetSelectDataWrapperProps>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 8px;

  .label-wrapper {
    padding: 0;
    text-transform: uppercase;
  }

  .assetSelectData-asset-avatar {
    margin-right: ${({ hasTarget }) => (hasTarget ? '0px' : '12px')};
  }

  .assetSelectData-asset-info {
    margin-left: ${({ hasTarget }) => (hasTarget ? '0px' : '4px')} !important;
  }

  .assetSelectData-asset-info,
  .assetSelectData-target-info {
    display: flex;
    flex-direction: ${({ type }) => (type === 'normal' ? 'column' : 'row')};
    margin: 0 4px;
  }

  .asset-price-info {
    display: flex;
    flex-grow: 1;
    justify-content: flex-end;

    ${(props) => props.size === 'big' && 'height: 32px;'}
    .label-wrapper {
      ${(props) =>
        props.size === 'big' &&
        `display: flex;
          align-items: flex-end;`}
    }
  }

  .assetSelectData-asset-label,
  .assetSelectData-asset-value,
  .assetSelectData-target-label,
  .assetSelectData-target-value {
    color: ${palette('text', 0)};
    font-weight: bold;
  }

  .assetSelectData-asset-label {
    margin-right: ${(props) => (props.type !== 'normal' ? '4px' : 0)};
  }
`

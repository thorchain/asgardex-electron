import styled from 'styled-components'
import { palette } from 'styled-theme'

export const AssetDataWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 8px;
  letter-spacing: 1px;

  .label-wrapper {
    padding: 0;
    text-transform: uppercase;
  }

  .coinData-coin-avatar {
    margin-right: 12px;
  }

  .coinData-asset-label {
    margin-right: 12px;
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    color: ${palette('text', 0)};
  }

  .asset-price-info {
    display: flex;
    justify-content: flex-end;
    flex-grow: 1;

    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    color: ${palette('text', 2)};
  }
`

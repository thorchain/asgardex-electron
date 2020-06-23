import styled from 'styled-components'
import { palette } from 'styled-theme'

import { transition } from '../../../../settings/style-util'

export const AssetInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 212px;
  height: 60px;
  padding: 9px;
  border: 1px solid ${palette('gray', 0)};
  border-radius: 2px;
  text-transform: uppercase;
  ${transition()};

  &:hover {
    border-color: ${palette('success', 0)};
  }

  .asset-input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .asset-input-title {
      font-size: 11px;
      color: ${palette('text', 2)};
      letter-spacing: 1px;
      margin-bottom: 2px;
    }

    .asset-input-header-label {
      font-size: 11px;
      color: ${palette('success', 1)};
      letter-spacing: 1px;
      margin-bottom: 2px;
    }
  }

  .asset-input-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .asset-amount-label {
      white-space: nowrap;
      font-size: 12px;
      color: ${palette('text', 2)};
      letter-spacing: 1px;
      text-align: right;
    }
  }
`

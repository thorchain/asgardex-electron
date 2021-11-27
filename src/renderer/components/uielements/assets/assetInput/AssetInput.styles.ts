import styled from 'styled-components'
import { palette } from 'styled-theme'

import { transition } from '../../../../settings/style-util'
import { Tooltip as UITooltip } from '../../common/Common.styles'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 212px;
  padding: 8px;
  border: 1px solid ${palette('gray', 0)};
  border-radius: 2px;
  text-transform: uppercase;
  ${transition()};
  border-color: ${palette('success', 0)};

  .asset-input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .asset-input-header-label {
      font-size: 12px;
      font-family: 'MainFontRegular';
      color: ${palette('success', 1)};
      letter-spacing: 1px;
      margin-bottom: 2px;
    }
  }

  .asset-input-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .asset-amount-label {
    white-space: nowrap;
    font-size: 12px;
    letter-spacing: 1px;
    text-align: right;
    margin: 0;
  }
`

export const Title = styled.p`
  font-size: 12px;
  font-family: 'MainFontRegular';
  letter-spacing: 1px;
  margin-bottom: 2px;
  cursor: default;
`

export const TitleTooltip = styled(UITooltip).attrs({
  overlayStyle: {
    textTransform: 'none',
    fontSize: 14,
    maxWidth: '400px',
    fontFamily: 'MainFontRegular'
  }
})``

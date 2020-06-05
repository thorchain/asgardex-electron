import styled from 'styled-components'
import { palette } from 'styled-theme'

export const CoinPairWrapper = styled.div`
  display: flex;
  justify-content: center;

  .coin-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-top: 3px;

    .label-wrapper {
      padding-bottom: 0;
    }
  }

  .arrow-icon {
    margin: 15px 15px;
    color: ${palette('text', 2)};
  }
`

import styled from 'styled-components'
import { palette } from 'styled-theme'

export const TxTimerWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;

  .timerchart-icon {
    position: absolute;
    top: 0px;
    left: 0px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: ${palette('background', 1)};

    width: 100%;
    height: 100%;

    .confirm-icon {
    }
  }

  .timerchart-circular-progressbar {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;

    &.hide {
      visibility: hidden;
    }
  }
`

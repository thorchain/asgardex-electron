import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'

export type PoolShareDirection = 'horizontal' | 'vertical'

type PoolShareWrapperProps = {}

export const PoolShareWrapper = styled.div<PoolShareWrapperProps>`
  .your-share-wrapper {
    padding: 40px 20px;

    ${media.lg`
          display: flex;
          flex-direction: column;
          justify-content: center;
        `}

    .label-title {
      font-size: 15px;
      text-align: center;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .label-wrapper {
      text-transform: uppercase;
    }

    .earning-label {
      margin-top: 40px;
    }

    .share-placeholder-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      width: 100%;
      height: 100%;
    }

    .placeholder-label {
      font-size: 14px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .placeholder-icon {
      display: flex;
      justify-content: center;
      align-items: center;

      width: 100px;
      height: 100px;
      margin-bottom: 20px;
      border-radius: 50%;
      background: ${palette('background', 1)};
      svg {
        width: 60px;
        height: 60px;
        path {
          fill: ${palette('gray', 1)};
        }
      }
    }

    .share-info-title {
      padding: 20px 0;
      text-align: center;
      text-transform: uppercase;

      border: 1px solid ${palette('gray', 0)};
      border-bottom: 3px solid ${palette('primary', 0)};
    }

    .your-share-info-wrapper {
      display: flex;
      flex-direction: column;
      padding-bottom: 5px;

      border: 1px solid ${palette('gray', 0)};
      border-top: none;

      .share-info-row {
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 10px;
        border-top: 1px solid ${palette('gray', 0)};
      }

      .your-share-info {
        & > div {
          text-align: center;
        }

        .status-title,
        .status-value {
          ${media.lg`
                padding: 3px 0;
              `}
        }

        .status-value {
          font-size: 20px;
        }
        .your-share-price-label {
          color: ${palette('text', 2)};
          ${media.lg`
                padding: 0;
              `}
        }
      }
    }
  }

  .your-share-wrapper {
    height: 100%;
    background: ${palette('background', 1)};
    box-shadow: 0px 1px 3px ${palette('gray', 0)};
    border-radius: 3px;
  }
`

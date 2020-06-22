import styled from 'styled-components'
import { palette } from 'styled-theme'

import Modal from '../../uielements/modal'

export const SwapModalWrapper = styled(Modal)`
  &.ant-modal {
    width: 420px !important;

    .ant-modal-body {
      padding: 0px;
    }
  }
`

export const SwapModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  .coinData-wrapper {
    padding-left: 0;
    padding-bottom: 4px;
    margin-left: 14px;
  }

  .status-wrapper {
    .status-title {
      padding-top: 0;
    }
    .status-value {
      padding-bottom: 0;
    }
  }

  .swapmodal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding: 30px 0;
    border-bottom: 1px solid ${palette('gray', 0)};

    .timer-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 30px;
    }

    .coin-data-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;

      .coin-data-container {
        display: flex;
        flex-direction: column;

        .coinData-wrapper {
          &:first-child {
            padding-bottom: 20px;
          }
        }
      }
    }
  }

  .swap-info-wrapper {
    display: flex;
    flex-direction: column;

    padding: 20px 0;
    .hash-address {
      display: flex;
      align-items: center;

      .copy-btn-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        border: 1px solid ${palette('gradient', 0)};
        border-radius: 6px;
        padding: 1px 4px;
        margin-right: 6px;
        margin-bottom: 16px;
        color: ${palette('gradient', 0)};
        cursor: pointer;

        .view-btn {
          width: 300px;
          height: 40px;
          margin-top: 24px;
        }

        a.view-tx {
          margin-top: 24px;
          color: ${palette('primary', 0)};
        }
      }

      .label-wrapper {
        width: 100%;
      }
    }
  }
`

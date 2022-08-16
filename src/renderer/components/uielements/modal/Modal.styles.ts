import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Modal = styled(A.Modal)`
  text-transform: uppercase;
  border-color: ${palette('gray', 0)};

  .ant-modal-header {
    padding: 10px 14px;
    text-align: center;
    background: ${palette('gradient', 0)};
    border: none;
    text-transform: uppercase;
    font-family: 'MainFontRegular';
    .ant-modal-title {
      color: ${palette('text', 3)};
    }
  }
  .ant-modal-body {
    padding: 30px;
    color: ${palette('text', 2)};
    background: ${palette('background', 1)};
    border-color: ${palette('gray', 0)};

    .ant-input-prefix {
      color: ${palette('gray', 0)};
    }
    .ant-form-item-extra,
    .ant-form-explain {
      color: ${palette('text', 2)};
    }
  }
  .ant-modal-close {
    .ant-modal-close-x {
      width: 40px;
      height: 40px;
      line-height: 40px;
      color: ${palette('text', 3)};
    }
  }
  .ant-modal-footer {
    height: 46px;
    padding: 0;
    background: ${palette('background', 1)};
    border-color: ${palette('gray', 0)};
    & > div {
      display: flex;
      flex-direction: row;
      height: 100%;
    }
  }

  .ok-ant-btn,
  .cancel-ant-btn {
    font-family: 'MainFontRegular';
    text-transform: uppercase;
    flex-grow: 1;
    height: 100%;
    border: none;
    border-radius: 0px;
    background: ${palette('background', 1)};
    color: ${palette('text', 2)};

    &:first-child {
      border-right: 1px solid ${palette('gray', 0)};
    }
    &:hover,
    &:active,
    &:focus {
      color: ${palette('primary', 0)};
    }

    &.ant-btn-primary {
      color: ${palette('primary', 0)};
      border-color: ${palette('gray', 0)};
      &:hover,
      &:active,
      &:focus {
        background-color: ${palette('gradient', 1)};
        border-color: ${palette('gray', 1)};
      }
    }
  }
`

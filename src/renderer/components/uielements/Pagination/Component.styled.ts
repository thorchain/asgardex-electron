import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

export const Pagination = styled(A.Pagination)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;

  .ant-pagination-item-link {
    transition: none;
    border-color: ${palette('primary', 0)};

    &:hover {
      border-color: ${palette('primary', 0)};
    }
    > .anticon {
      color: ${palette('primary', 0)};
    }
  }

  .ant-pagination-item {
    background: ${palette('background', 1)};
    border-color: ${palette('gray', 0)};
    color: ${palette('text', 0)};

    > a {
      color: ${palette('primary', 0)};
    }

    &:hover {
      border-color: ${palette('primary', 0)};
      background: ${palette('background', 2)};
      color: ${palette('primary', 0)};
    }

    &.ant-pagination-item-active {
      border-color: ${palette('primary', 0)};
      cursor: not-allowed;

      &:hover {
        background: ${palette('background', 1)};
      }
    }
  }

  .ant-pagination-item-link {
    color: ${palette('primary', 0)};
    background: ${palette('background', 1)};

    &:hover {
      border-color: ${palette('primary', 0)};
      background: ${palette('background', 2)};
      color: ${palette('primary', 0)};
    }

    &:disabled {
      opacity: 0.5;
      background: ${palette('background', 1)};
    }
  }

  .ant-pagination-item-container .ant-pagination-item-ellipsis {
    color: ${palette('primary', 0)};
  }

  .ant-pagination-item-link-icon {
    color: ${palette('primary', 0)} !important;
  }
`

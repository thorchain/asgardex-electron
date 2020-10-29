import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Label } from '../label'

export const Alert = styled(A.Alert)`
  /* description */
  &.ant-alert {
    background-color: ${palette('background', 0)};
  }
  /* headline */
  .ant-alert-message {
    text-transform: uppercase;
  }

  /* description */
  .ant-alert-description {
    text-transform: uppercase;
    color: ${palette('text', 0)};
  }

  &.ant-alert-info {
    border-color: ${palette('gray', 1)};
    > .ant-alert-icon > svg {
      color: ${palette('gray', 1)};
    }

    .ant-alert-message {
      color: ${palette('gray', 2)};
    }
  }

  &.ant-alert-warning {
    border-color: ${palette('warning', 2)};
    > .ant-alert-icon > svg {
      color: ${palette('warning', 0)};
    }

    .ant-alert-message {
      color: ${palette('warning', 0)};
    }
  }

  &.ant-alert-success {
    border-color: ${palette('success', 0)};
    > .ant-alert-icon > svg {
      color: ${palette('success', 0)};
    }

    .ant-alert-message {
      color: ${palette('success', 0)};
    }
  }

  &.ant-alert-error {
    background-color: ${palette('background', 1)};
    border-color: ${palette('error', 0)};

    .ant-alert-message {
      color: ${palette('error', 0)};
    }
  }
`

export const Description = styled(Label)`
  color: ${palette('text', 1)};
  padding: 0;
`

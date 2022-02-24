import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { InnerForm } from '../../shared/form/Form.styles'

export const TitleContainer = styled(A.Row).attrs({ justify: 'space-between' })`
  margin-bottom: 16px;
`

export const SectionTitle = styled(A.Typography.Text)`
  text-transform: uppercase;
  font-size: 16px;
  color: ${palette('text', 0)};

  // Copy to Clipboard and reset mnemonic phrase action icons
  // Keep them here together to avoid inconsistency
  > [role='button'],
  button {
    color: ${palette('primary', 0)};
  }
`

export const Form = styled(InnerForm)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

export const FormItem = styled(A.Form.Item)`
  & .ant-form-item {
    &-control {
      margin-bottom: 32px;
    }

    &-explain-error {
      text-transform: uppercase;
    }
  }
`

export const SubmitItem = styled(A.Form.Item)`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  // This is safety 'cause we set it only for submit item's container
  .ant-col.ant-form-item-control {
    width: auto !important;
  }
`

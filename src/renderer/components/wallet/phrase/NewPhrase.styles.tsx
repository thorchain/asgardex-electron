import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { InnerForm } from '../../shared/form/Form.style'

export const TitleContainer = styled(A.Row).attrs({ justify: 'space-between' })`
  margin-bottom: 16px;
`

export const SectionTitle = styled(A.Typography.Text)`
  text-transform: uppercase;
  font-size: 16px;
  color: ${palette('gray', 2)};

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

export const PasswordContainer = styled(A.Row)`
  max-width: 280px;
`
export const PasswordItem = styled(A.Form.Item)`
  width: 100%;
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

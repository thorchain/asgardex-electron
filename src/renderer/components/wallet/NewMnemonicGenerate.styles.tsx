import * as A from 'antd'
import styled from 'styled-components'

export const Form = styled(A.Form)`
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

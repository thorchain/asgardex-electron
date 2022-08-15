import * as A from 'antd'
import styled from 'styled-components'

export const TitleContainer = styled(A.Row).attrs({ justify: 'space-between' })`
  margin-bottom: 16px;
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

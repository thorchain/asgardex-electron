import { Row } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ErrorView as UIErrorView } from '../../shared/error'
import { Button } from '../../uielements/button'
import { Modal as UIModal } from '../../uielements/modal'

export const Modal = styled(UIModal)`
  &.ant-modal {
    width: 420px;

    .ant-modal-body {
      padding: 0px;
    }
  }
`

export const ContentRow = styled(Row).attrs({
  align: 'middle',
  justify: 'center'
})`
  width: 100%;
  padding: 30px 0;
  border-bottom: 1px solid ${palette('gray', 0)};
`

export const ResultDetailsContainer = styled(Row).attrs({
  align: 'middle',
  justify: 'center'
})``

export const BtnCopyWrapper = styled.div`
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
`

export const ViewButton = styled(Button)`
  width: 300px;
  height: 40px;
  margin-top: 24px;
`

export const ViewTransaction = styled.a`
  margin-top: 24px;
  color: ${palette('primary', 0)};
`

export const ErrorView = styled(UIErrorView)`
  padding: 0px;
`

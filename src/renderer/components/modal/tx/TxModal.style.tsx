import React from 'react'

import { Row } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ErrorView as UIErrorView } from '../../shared/error'
import { Button as UIButton } from '../../uielements/button'
import { ExternalLinkIcon as UIExternalLinkIcon } from '../../uielements/common/Common.style'
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

export const ViewButton = styled(UIButton)`
  width: 300px;
  height: 40px;
  margin: 24px 0;
`

const ExternalLinkIcon = styled(UIExternalLinkIcon)`
  svg {
    color: ${palette('primary', 0)};
  }
`

export const ViewTxButton = styled(UIButton).attrs({
  typevalue: 'transparent',
  icon: <ExternalLinkIcon />
})``

export const ErrorView = styled(UIErrorView)`
  padding: 0px;
`

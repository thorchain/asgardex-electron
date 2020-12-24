import React from 'react'

import { Row } from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Button as UIButton } from '../../uielements/button'
import { ExternalLinkIcon as UIExternalLinkIcon } from '../../uielements/common/Common.style'
import { Modal } from '../../uielements/modal'

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
`

export const SwapModalContentRow = styled(Row)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 30px 0;
  border-bottom: 1px solid ${palette('gray', 0)};
`

export const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 30px;
`

export const CoinDataWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

export const CoinDataContainer = styled.div`
  display: flex;
  flex-direction: column;

  .coinData-wrapper {
    &:first-child {
      padding-bottom: 20px;
    }
  }
`

export const SwapInfoWrapper = styled(Row)`
  display: flex;
  flex-direction: column;
  padding: 20px 0;
`

export const HashWrapper = styled.div`
  display: flex;
  align-items: center;
`

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
  margin-top: 24px;
`

const ExternalLinkIcon = styled(UIExternalLinkIcon)`
  svg {
    color: ${palette('primary', 0)};
  }
`

export const ViewTransaction = styled(UIButton).attrs({
  typevalue: 'transparent',
  icon: <ExternalLinkIcon />
})`
  margin-top: 24px;
`

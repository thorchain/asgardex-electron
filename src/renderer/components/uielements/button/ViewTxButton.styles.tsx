import React from 'react'

import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Button as UIButton } from '.'
import { ExternalLinkIcon as UIExternalLinkIcon } from '../common/Common.styles'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
`

const ExternalLinkIcon = styled(UIExternalLinkIcon)`
  svg {
    color: ${palette('primary', 0)};
  }
`

export const ViewTxButton = styled(UIButton).attrs({
  typevalue: 'transparent',
  icon: <ExternalLinkIcon />
})`
  padding-right: 5px;
`

const ICON_SIZE = 19

export const CopyLabel = styled(A.Typography.Text)`
  svg {
    color: ${palette('primary', 0)};
    height: ${ICON_SIZE}px;
    width: ${ICON_SIZE}px;
  }
`

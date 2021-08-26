import React from 'react'

import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Button as UIButton } from '.'
import { ExternalLinkIcon as UIExternalLinkIcon } from '../common/Common.styles'

const ExternalLinkIcon = styled(UIExternalLinkIcon)`
  svg {
    color: ${palette('primary', 0)};
  }
`

export const ViewTxButton = styled(UIButton).attrs({
  typevalue: 'transparent',
  icon: <ExternalLinkIcon />
})``

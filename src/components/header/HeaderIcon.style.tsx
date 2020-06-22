import * as React from 'react'

import { Row } from 'antd'
import { RowProps } from 'antd/lib/row'
import styled from 'styled-components'

import { media } from '../../helpers/styleHelper'

type HeaderIconWrapperProps = RowProps & { disabled?: boolean }

const Wrapper: React.FC<HeaderIconWrapperProps> = ({ children, ...otherProps }) => <Row {...otherProps}>{children}</Row>

export const HeaderIconWrapper = styled(Wrapper)`
  cursor: ${({ disabled = false }) => (disabled ? 'not-allowed' : 'pointer')};
  justify-content: space-between;
  width: 100vw;
  padding: 0 15px;
  height: 60px;
  align-items: center;

  svg {
    opacity: ${({ disabled = false }) => (disabled ? 0.5 : 1)};
  }

  ${media.lg`
    width: auto;
    padding: 0 10px;
  `}
`

import * as React from 'react'

import { Row } from 'antd'
import { RowProps } from 'antd/lib/row'
import Text from 'antd/lib/typography/Text'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../../helpers/styleHelper'

type Props = RowProps & { disabled: boolean }

const Wrapper: React.FC<Props> = ({ children, ...otherProps }) => <Row {...otherProps}>{children}</Row>

export const HeaderLockWrapper = styled(Wrapper)`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  justify-content: space-between;
  width: 100vw;
  padding: 0 15px;
  height: 60px;
  align-items: center;

  ${media.lg`
    width: auto;
    padding: 0;
  `}
`

export const Label = styled(Text)`
  text-transform: uppercase;
  color: ${palette('text', 0)};
`

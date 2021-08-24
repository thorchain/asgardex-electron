import * as React from 'react'

import { Row } from 'antd'
import { RowProps } from 'antd/lib/row'
import Text from 'antd/lib/typography/Text'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { ReactComponent as LockWarningIconUI } from '../../../assets/svg/icon-lock-warning.svg'
import { ReactComponent as UnlockWarningIconUI } from '../../../assets/svg/icon-unlock-warning.svg'
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

export const LockIcon = styled(LockWarningIconUI)`
  font-size: '1.5em';
  cursor: pointer;
`

export const UnlockIcon = styled(UnlockWarningIconUI)`
  font-size: '1.5em';
  cursor: pointer;
`

export const Label = styled(Text)`
  text-transform: uppercase;
  color: ${palette('text', 0)};
`

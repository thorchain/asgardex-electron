import * as A from 'antd'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Button as UIButton } from '../../uielements/button'

export const Card = styled(A.Card).attrs({
  bodyStyle: { padding: '6px', minHeight: '100px' }
})`
  border-color: ${palette('primary', 0)};
  background: transparent;
`

const iconClassName = 'mnemonic-word__icon'
export const IconWrapper = styled('span').attrs({ className: iconClassName })`
  margin-left: 8px;
  opacity: 0;
`

export const Button = styled(A.Button)<{ readOnly?: boolean }>`
  font-weight: bold;
  cursor: ${(props) => (props?.readOnly ? 'default' : 'pointer')};
  color: ${palette('text', 0)} !important;

  &:hover,
  &:active,
  &:focus {
    background: ${(props) => (props?.readOnly ? 'none' : palette('gray', 0))};

    .${iconClassName} {
      opacity: 1;
    }
  }

  ${({ disabled }) => disabled && `opacity: 0.5;`}
`

export const EnterPhraseContainer = styled(A.Form.Item)`
  flex: 1;
  flex-direction: column;
`

export const Row = styled(A.Row)`
  margin-bottom: 32px;
`

export const PasswordContainer = styled(A.Row)`
  max-width: 280px;
`
export const PasswordItem = styled(A.Form.Item)`
  width: 100%;
`

export const ImportButton = styled(UIButton).attrs({
  size: 'large',
  type: 'primary',
  htmlType: 'submit',
  round: 'true'
})`
  min-width: 150px !important;
`

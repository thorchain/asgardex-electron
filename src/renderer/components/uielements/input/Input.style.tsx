import * as A from 'antd'
import { SizeType } from 'antd/lib/config-provider/SizeContext'
import * as AI from 'antd/lib/input'
import styled, { css } from 'styled-components'
import { palette, key } from 'styled-theme'

import { Color, Colors, FontSettings, InputType } from './types'

const fontSettings: FontSettings = {
  small: {
    size: key('sizes.font.small', '10px'),
    spacing: '0.5px'
  },
  middle: {
    size: key('sizes.font.normal', '11px'),
    spacing: '0.5px'
  },
  large: {
    size: key('sizes.font.normal', '12px'),
    spacing: '0.5px'
  }
}

const sizes: Record<NonNullable<SizeType>, string> = {
  small: '20px',
  middle: '25px',
  large: '32px'
}

const colors: Colors = {
  primary: palette('primary', 0),
  success: palette('success', 0),
  warning: palette('warning', 0),
  error: palette('error', 0)
}

type CustomInputProps = {
  color?: Color
  typevalue?: InputType
}

export type InputProps = CustomInputProps & AI.InputProps

const inputStyle = css<InputProps>`
  height: ${({ size = 'middle' }) => sizes[size]};
  font-size: ${({ size = 'middle' }) => fontSettings[size].size};
  letter-spacing: ${({ size = 'middle' }) => fontSettings[size].spacing};
  ${({ typevalue }) => typevalue === 'ghost' && 'border: none;'};
  ${({ typevalue }) => typevalue === 'ghost' && 'background: #F0F3F7;'};
  border-color: ${({ color = 'primary', typevalue = 'normal' }) =>
    typevalue === 'ghost' ? 'transparent' : colors[color]};

  background: ${palette('background', 1)};
  color: ${palette('text', 0)};
  input,
  input:-internal-autofill-selected {
    color: ${palette('text', 0)};
    background: ${palette('background', 1)};
  }

  &:hover,
  &:focus {
    border-color: ${({ color = 'primary' }) => colors[color]};
    box-shadow: ${({ typevalue = 'normal', color = 'primary' }) =>
      typevalue === 'ghost' ? 'none' : '0 0 0 2px ' + colors[color]};
  }

  .ant-form-item-has-error {
    border-color: ${({ typevalue = 'normal' }) => (typevalue === 'ghost' ? 'transparent' : colors['error'])} !important;
  }
`

export const Input = styled(A.Input)<InputProps>`
  ${inputStyle}
`

export const InputNumber = styled(A.InputNumber)<InputProps>`
  ${inputStyle}
  width: 100%;

  & .ant-input-number-input,
  & .ant-input-number-input-wrap {
    height: 100%;
  }
`

export const InputPassword = styled(A.Input.Password)<InputProps>`
  ${inputStyle}
  & .ant-input-password-icon {
    color: ${colors.primary};
  }
`

export const InputTextArea = styled(A.Input.TextArea)<InputProps>`
  ${inputStyle}
`

export const InputBigNumber = styled(A.Input)<InputProps>`
  ${inputStyle}
`

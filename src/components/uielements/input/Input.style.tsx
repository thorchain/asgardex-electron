import { Input } from 'antd'
import styled from 'styled-components'
import { palette, key } from 'styled-theme'

import { Color, Colors, FontSettings, InputType, Size, Sizes } from './types'

export type InputWrapperProps = {
  sizevalue: Size
  color: Color
  typevalue: InputType
}

const fontSettings: FontSettings = {
  small: {
    size: key('sizes.font.small', '10px'),
    spacing: '0.5px'
  },
  normal: {
    size: key('sizes.font.normal', '11px'),
    spacing: '0.5px'
  },
  big: {
    size: key('sizes.font.normal', '12px'),
    spacing: '0.5px'
  }
}

const sizes: Sizes = {
  small: '20px',
  normal: '25px',
  big: '32px'
}

const colors: Colors = {
  primary: palette('primary', 0),
  success: palette('success', 0),
  warning: palette('warning', 0),
  error: palette('error', 0)
}

export const InputWrapper = styled(Input)`
  &.ant-input-affix-wrapper,
  &.ant-input {
    height: ${(props: InputWrapperProps) => sizes[props.sizevalue]};
    font-size: ${(props: InputWrapperProps) => fontSettings[props.sizevalue].size};
    letter-spacing: ${(props: InputWrapperProps) => fontSettings[props.sizevalue].spacing};
    ${(props: InputWrapperProps) => props.typevalue === 'ghost' && 'border: none;'};
    ${(props: InputWrapperProps) => props.typevalue === 'ghost' && 'background: #F0F3F7;'};

    border: 1px solid ${palette('gray', 0)};
    background: ${palette('background', 1)};
    color: ${palette('text', 0)};
    input,
    input:-internal-autofill-selected {
      color: ${palette('text', 0)};
      background: ${palette('background', 1)};
    }

    &:hover,
    &:focus {
      border-color: ${(props: InputWrapperProps) => colors[props.color]};
      --antd-wave-shadow-color: ${(props: InputWrapperProps) => colors[props.color]};
      box-shadow: ${(props: InputWrapperProps) =>
        props.typevalue === 'ghost' ? 'none' : '0 0 0 2px ' + colors[props.color]};
    }
  }
`

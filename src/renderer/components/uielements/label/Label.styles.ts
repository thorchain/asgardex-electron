import React from 'react'

import * as A from 'antd'
import styled from 'styled-components'
import { palette, key } from 'styled-theme'

import { Size, Color, FontSettings, Colors, TextTransform, TextAlignment } from './Label.types'

export type Props = {
  align?: TextAlignment
  size?: Size
  color?: Color
  disabled?: boolean
  weight?: 'normal' | 'bold'
  textTransform?: TextTransform
  nowrap?: boolean
  onClick?: (_: React.MouseEvent<HTMLElement>) => void
  ref?: unknown
}

const fontSettings: FontSettings = {
  tiny: {
    size: key('sizes.font.tiny', '8px'),
    spacing: '0.36px'
  },
  small: {
    size: key('sizes.font.small', '10px'),
    spacing: '0.42px'
  },
  normal: {
    size: key('sizes.font.normal', '12px'),
    spacing: '1px'
  },
  big: {
    size: key('sizes.font.big', '15px'),
    spacing: '1px'
  },
  large: {
    size: key('sizes.font.large', '18px'),
    spacing: '1px'
  }
}

const colors: Colors = {
  primary: palette('primary', 0),
  success: palette('success', 0),
  warning: palette('warning', 0),
  error: palette('error', 0),
  normal: palette('text', 0),
  light: palette('text', 2),
  dark: palette('text', 1),
  gray: palette('text', 2),
  input: palette('text', 2),
  white: '#fff'
}

export const LabelWrapper = styled.div<Props>`
  padding: 0;
  width: 100%;
  white-space: ${({ nowrap = false }) => (nowrap ? 'nowrap' : 'normal')};
  font-size: ${({ size = 'normal' }) => fontSettings[size].size};
  text-transform: ${({ textTransform = 'none' }) => textTransform};
  font-family: ${({ weight }) => (weight === 'bold' ? 'MainFontBold' : 'MainFontRegular')};
  letter-spacing: ${({ size = 'normal' }) => fontSettings[size].spacing};
  color: ${({ color }) => colors[color || 'normal']};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ onClick }) => onClick && 'pointer'};
  text-align: ${({ align = 'left' }) => align};
`

export const Skeleton = styled(A.Skeleton).attrs({
  title: false,
  paragraph: { rows: 1 },
  active: true
})`
  .ant-skeleton {
    &-paragraph {
      margin: 0;
    }
  }
`

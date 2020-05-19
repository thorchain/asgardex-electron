import styled from 'styled-components'
import { palette, key } from 'styled-theme'

import { Props } from './label'
import { FontSettings, Colors } from './types'

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
  gradient: palette('gradient', 0),
  primary: palette('primary', 0),
  success: palette('success', 0),
  warning: palette('warning', 0),
  error: palette('error', 0),
  normal: palette('text', 0),
  light: palette('text', 2),
  dark: palette('text', 1),
  white: '#fff'
}

export const LabelWrapper = styled.div`
  padding: 10px 0;
  font-size: ${(props: Props) => fontSettings[props.size || 'normal'].size};
  font-weight: ${(props: Props) => props.weight};
  letter-spacing: ${(props: Props) => fontSettings[props.size || 'normal'].spacing};
  color: ${(props: Props) => colors[props.color || 'normal']};
  cursor: ${(props: Props) => props.onClick && 'pointer'};
`

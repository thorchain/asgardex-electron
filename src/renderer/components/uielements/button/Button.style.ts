import { Button } from 'antd'
import { ButtonProps } from 'antd/lib/button'
import styled from 'styled-components'
import { palette, key } from 'styled-theme'

import { ButtonColor, ButtonRound, ButtonSize, ButtonWeight, ButtonType } from './Button.types'

const fontSettings = {
  small: {
    size: key('sizes.font.small', '10px'),
    spacing: '0.5px'
  },
  normal: {
    size: key('sizes.font.normal', '11px'),
    spacing: '2.5px'
  },
  xnormal: {
    size: key('sizes.font.xnormal', '16px'),
    spacing: '2.5px'
  },
  big: {
    size: '21px',
    spacing: '3.0px'
  }
}

const sizes = {
  small: {
    width: key('sizes.button.small.width', '55px'),
    height: key('sizes.button.small.height', '20px'),
    borderBottom: '2px'
  },
  normal: {
    width: key('sizes.button.normal.width', '100px'),
    height: key('sizes.button.normal.height', '30px'),
    borderBottom: '3px'
  },
  xnormal: {
    width: key('sizes.button.xnormal.width', '180px'),
    height: key('sizes.button.xnormal.height', '38px'),
    borderBottom: '3px'
  },
  big: {
    width: key('sizes.button.big.width', '300px'),
    height: '55px',
    borderBottom: '4px'
  }
}

type ColorGroup = {
  main: string
  darken: string
  lighten: string
  text: string
  borderBottom: string
}

type ColorGroups = {
  [key in ButtonColor]: ColorGroup
}

const colorGroups: ColorGroups = {
  primary: {
    main: palette('gradient', 0),
    darken: palette('gradient', 1),
    lighten: palette('gradient', 2),
    text: palette('primary', 0),
    borderBottom: palette('gradient', 0)
  },
  success: {
    main: palette('success', 0),
    darken: palette('success', 1),
    lighten: palette('success', 2),
    text: palette('success', 0),
    borderBottom: palette('success', 3)
  },
  warning: {
    main: palette('warning', 0),
    darken: palette('warning', 1),
    lighten: palette('warning', 2),
    text: palette('warning', 0),
    borderBottom: palette('warning', 3)
  },
  error: {
    main: palette('error', 0),
    darken: palette('error', 1),
    lighten: palette('error', 2),
    text: palette('error', 0),
    borderBottom: palette('error', 3)
  }
}

type ButtonThemeValue = {
  text: string
  border?: string
  background?: string
  action?: {
    text?: string
    border?: string
    background?: string
  }
  focus?: {
    border?: string
    borderBottom?: string
  }
}

type ButtonTheme = {
  [key in ButtonType]?: ButtonThemeValue
}

type ButtonThemes = {
  [key in ButtonColor]?: ButtonTheme
}

const getThemes = () => {
  const theme: ButtonThemes = {}

  Object.keys(colorGroups).forEach((colorType) => {
    const value: ButtonTheme = {}
    const { main, lighten, darken, text, borderBottom } = colorGroups[colorType as ButtonColor]

    value.default = {
      text: palette('text', 3),
      border: text,
      background: main,
      action: {
        text: palette('text', 3),
        border: darken,
        background: darken
      },
      focus: {
        border: darken
      }
    }

    value.outline = {
      text,
      border: text,
      background: palette('background', 1),
      action: {
        text: palette('text', 3),
        border: text,
        background: main
      },
      focus: {
        border: text
      }
    }
    value.ghost = {
      text: palette('text', 2),
      border: palette('gray', 0),
      background: palette('background', 1),
      action: {
        text: main,
        border: main,
        background: lighten
      },
      focus: {
        border: main
      }
    }

    value.normal = {
      text: palette('text', 0),
      border: palette('gray', 0),
      background: palette('background', 1),
      action: {
        text: palette('text', 0),
        border: palette('gray', 0),
        background: palette('background', 1)
      },
      focus: {
        border: palette('gray', 0),
        borderBottom
      }
    }

    value.transparent = {
      text: palette('success', 0),
      action: {
        text: palette('success', 1),
        background: 'transparent'
      }
    }

    value.underline = {
      text: palette('success', 0),
      action: {
        text: palette('success', 1),
        background: 'transparent'
      }
    }

    theme[colorType as ButtonColor] = value
  })

  return theme
}

const themes: ButtonThemes = getThemes()

const getThemeValue = (color: ButtonColor, typeValue: ButtonType) => {
  const theme = themes[color]
  const themValue = theme && theme[typeValue]
  return themValue
}

export type ButtonWrapperProps = {
  round: ButtonRound
  color: ButtonColor
  sizevalue: ButtonSize
  weight: ButtonWeight
  typevalue: ButtonType
}

type Props = ButtonWrapperProps & ButtonProps

export const ButtonWrapper = styled(Button)<Props>`
  &.ant-btn {
    display: flex;
    justify-content: space-around;
    align-items: center;
    border-radius: ${(props) => (props.round === 'true' ? sizes[props.sizevalue].height : '3px')};
    min-width: ${(props) => sizes[props.sizevalue].width};
    height: ${(props) => sizes[props.sizevalue].height};
    font-size: ${(props) => fontSettings[props.sizevalue].size};
    font-weight: ${(props) => props.weight};
    letter-spacing: ${(props) => fontSettings[props.sizevalue].spacing};
    box-shadow: none; /* overridden */

    text-transform: uppercase;
    text-decoration: ${({ typevalue }) => (typevalue === 'underline' ? 'underline' : 'none')};

    /* set theme colors away from antd defaults */
    &,
    &:active,
    &:focus {
      color: ${(props) => getThemeValue(props.color, props.typevalue)?.text ?? ''};
      border-color: ${(props) => getThemeValue(props.color, props.typevalue)?.border ?? 'transparent'};
      background: ${(props) => getThemeValue(props.color, props.typevalue)?.background ?? 'transparent'};
      ${(props) =>
        props.typevalue === 'normal' &&
        `
          background-position: 0 100%;
          background-repeat: no-repeat;
          -webkit-background-size: 100% 3px;
          -moz-background-size: 100% 3px;
          background-size: 100% 3px;
        `}
    }

    &:disabled {
      background: ${(props) => getThemeValue(props.color, props.typevalue)?.background ?? 'transparent'};
      opacity: 0.75;
    }

    /* provide focus styles over the underlying styles */
    &:focus,
    &:active {
      border-color: ${(props) =>
        getThemeValue(props.color, props.typevalue)?.focus?.border ??
        'transparent'} !important; /* (Rudi): HACK: Border is overridden in selection.style.js buttons we need to create a new style for these buttons remove this when ready */
    }

    /* apply special override styles for .focused class */
    &.focused,
    &:hover {
      &,
      &:focus,
      &:active {
        color: ${(props) => getThemeValue(props.color, props.typevalue)?.action?.text ?? ''};
        text-decoration: ${({ typevalue }) => (typevalue === 'underline' ? 'underline' : 'none')};
        border-color: ${(props) => getThemeValue(props.color, props.typevalue)?.action?.border ?? 'transparent'};
        background: ${(props) =>
          props.typevalue === 'normal'
            ? !props.disabled && (getThemeValue(props.color, props.typevalue)?.focus?.borderBottom ?? 'transparent')
            : !props.disabled && (getThemeValue(props.color, props.typevalue)?.action?.background ?? 'transparent')};
        ${(props) =>
          props.typevalue === 'normal' &&
          `
          background-position: 0 100%;
          background-repeat: no-repeat;
          -webkit-background-size: 100% 3px;
          -moz-background-size: 100% 3px;
          background-size: 100% 3px;
        `}
        &:disabled {
          color: ${(props) => getThemeValue(props.color, props.typevalue)?.text ?? ''};
        }
      }
    }

    svg {
      font-size: 18px;
    }
  }
`

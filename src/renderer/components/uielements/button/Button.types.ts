import * as AB from 'antd/lib/button'

export type ButtonSize = 'small' | 'normal' | 'xnormal' | 'big'
export type ButtonColor = 'primary' | 'success' | 'warning' | 'error'
export type ButtonWeight = 'normal' | 'bold' | '500'
export type ButtonType = 'normal' | 'default' | 'outline' | 'ghost' | 'transparent' | 'underline'
export type ButtonRound = 'true' | 'false'

export type ComponentProps = {
  sizevalue?: ButtonSize
  color?: ButtonColor
  weight?: ButtonWeight
  typevalue?: ButtonType
  focused?: boolean
  round?: ButtonRound
  className?: string
}

export type ButtonProps = ComponentProps & AB.ButtonProps

// Tailwind based button types
export type Size = 'small' | 'normal' | 'large'
export type Color = 'primary' | 'warning' | 'error'

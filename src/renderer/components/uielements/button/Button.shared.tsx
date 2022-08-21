import { Size, Color } from './Button.types'

export const dropShadow: Record<Size, string> = {
  small: 'drop-shadow-md',
  medium: 'drop-shadow-lg',
  normal: 'drop-shadow-lg',
  large: 'drop-shadow-lg'
}

export const borderSize: Record<Size, string> = {
  small: 'border',
  medium: 'border',
  normal: 'border',
  large: 'border-2'
}

export const borderColor: Record<Color, string> = {
  primary: 'border-turquoise',
  warning: 'border-warning0',
  error: 'border-error0',
  neutral: 'border-text0 dark:border-text0d'
}

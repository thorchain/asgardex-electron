export type TextAlignment = 'left' | 'center' | 'right' | 'justify'

export type Size = 'tiny' | 'small' | 'normal' | 'big' | 'large'

export type Weight = 'light' | 'bold' | 'normal'

export type Color =
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'normal'
  | 'light'
  | 'dark'
  | 'gray'
  | 'input'
  | 'white'

type FontSetting = {
  size: string
  spacing: string
}

export type FontSettings = {
  [key: string]: FontSetting
}

export type Colors = {
  [key in Color]: string
}

export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'

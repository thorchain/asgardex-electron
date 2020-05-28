export type Size = 'small' | 'normal' | 'big'

export type Color = 'primary' | 'success' | 'warning' | 'error'

export type InputType = 'normal' | 'ghost'

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

export type Sizes = {
  [key in Size]: string
}

export type Size = 'tiny' | 'small' | 'normal' | 'big' | 'large'

export type Color = 'primary' | 'success' | 'warning' | 'error' | 'normal' | 'light' | 'dark' | 'white'

type FontSetting = {
  size: string
  spacing: string
}

export type FontSettings = {
  [key: string]: FontSetting
}

export type Colors = {
  [key: string]: string
}

export type SizeOptions = {
  [key: string]: Size
}

export type WeightOptions = {
  [key: string]: string
}

export type ColorOptions = {
  [key: string]: Color
}

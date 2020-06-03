export type Size = 'tiny' | 'small' | 'normal' | 'big' | 'large'

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

import { SizeType } from 'antd/lib/config-provider/SizeContext'

export type Color = 'primary' | 'success' | 'warning' | 'error'

export type InputType = 'normal' | 'ghost'

export type InputSecurity = 'normal' | 'password'

type FontSetting = {
  size: string
  spacing: string
}

export type FontSettings = Record<NonNullable<SizeType>, FontSetting>

export type Colors = {
  [key in Color]: string
}

export type Size = 'small' | 'normal' | 'large'

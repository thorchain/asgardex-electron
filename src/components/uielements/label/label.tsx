import React from 'react'

import { LabelWrapper } from './label.style'
import { Size, Color, TextAlignment } from './types'

export type Props = {
  align?: TextAlignment
  size?: Size
  color?: Color
  weight?: string
  className?: string
  children?: React.ReactNode
  loading?: boolean
  onClick?: () => void
}

const Label: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    loading = false,
    align = 'left',
    size = 'normal',
    color = 'normal',
    weight = 'normal',
    children,
    className = '',
    ...otherProps
  } = props

  return (
    <LabelWrapper
      className={`label-wrapper ${className}`}
      align={align}
      size={size}
      color={color}
      weight={weight}
      {...otherProps}>
      {loading && '...'}
      {!loading && children}
    </LabelWrapper>
  )
}

Label.defaultProps = {
  align: 'left',
  size: 'normal',
  color: 'normal',
  weight: 'normal',
  loading: false
}

export default Label

import React from 'react'

import { LabelWrapper } from './label.style'
import { Size, Color } from './types'

export type Props = {
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
    size = 'normal',
    color = 'normal',
    weight = 'normal',
    children,
    className = '',
    ...otherProps
  } = props

  return (
    <LabelWrapper className={`label-wrapper ${className}`} size={size} color={color} weight={weight} {...otherProps}>
      {loading && '...'}
      {!loading && children}
    </LabelWrapper>
  )
}

Label.defaultProps = {
  size: 'normal',
  color: 'normal',
  weight: 'normal',
  loading: false
}

export default Label

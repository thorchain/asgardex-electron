import React from 'react'

import { LabelWrapper, Props as StyledProps } from './label.style'

export type ComponentProps = {
  className?: string
  children?: React.ReactNode
  loading?: boolean
  nowrap?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export type LabelProps = ComponentProps & StyledProps

const Label: React.FC<LabelProps> = (props: LabelProps): JSX.Element => {
  const {
    loading = false,
    align = 'left',
    size = 'normal',
    color = 'normal',
    weight = 'normal',
    textTransform = 'none',
    nowrap = false,
    children,
    className = '',
    onClick = () => {},
    style
  } = props

  return (
    <LabelWrapper
      className={`label-wrapper ${className}`}
      size={size}
      color={color}
      weight={weight}
      textTransform={textTransform}
      style={style}
      align={align}
      nowrap={nowrap}
      onClick={onClick}>
      {loading && '...'}
      {!loading && children}
    </LabelWrapper>
  )
}

export default Label

import React from 'react'

import { LabelWrapper, Props as StyledProps } from './label.style'

export type ComponentProps = {
  className?: string
  children?: React.ReactNode
  loading?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

type Props = ComponentProps & StyledProps

const Label: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    loading = false,
    align = 'left',
    size = 'normal',
    color = 'normal',
    weight = 'normal',
    textTransform = 'none',
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
      onClick={onClick}>
      {loading && '...'}
      {!loading && children}
    </LabelWrapper>
  )
}

export default Label

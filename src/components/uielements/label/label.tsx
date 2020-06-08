import React from 'react'

import { LabelWrapper, Props as StyledProps } from './label.style'

export type ComponentProps = {
  className?: string
  children?: React.ReactNode
  loading?: boolean
  onClick?: () => void
}

type Props = ComponentProps & StyledProps

const Label: React.FC<Props> = (props: Props): JSX.Element => {
  const {
    loading = false,
    size = 'normal',
    color = 'normal',
    weight = 'normal',
    textTransform = 'none',
    children,
    className = '',
    ...otherProps
  } = props

  return (
    <LabelWrapper
      className={`label-wrapper ${className}`}
      size={size}
      color={color}
      weight={weight}
      textTransform={textTransform}
      {...otherProps}>
      {loading && '...'}
      {!loading && children}
    </LabelWrapper>
  )
}

export default Label

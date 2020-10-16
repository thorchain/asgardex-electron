import React from 'react'

import * as Styled from './Label.style'

export type ComponentProps = {
  className?: string
  children?: React.ReactNode
  loading?: boolean
  nowrap?: boolean
  onClick?: (_: React.MouseEvent<HTMLElement>) => void
  style?: React.CSSProperties
}

export type LabelProps = ComponentProps & Styled.Props

export const Label = React.forwardRef<HTMLDivElement, LabelProps>(
  (props, ref): JSX.Element => {
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
      disabled = false,
      onClick,
      style
    } = props

    return (
      <Styled.LabelWrapper
        ref={ref}
        className={`label-wrapper ${className}`}
        size={size}
        color={color}
        weight={weight}
        textTransform={textTransform}
        style={style}
        align={align}
        nowrap={nowrap}
        disabled={disabled}
        onClick={onClick}>
        {loading && <Styled.Skeleton />}
        {!loading && children}
      </Styled.LabelWrapper>
    )
  }
)

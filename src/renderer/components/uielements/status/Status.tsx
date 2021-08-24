import React from 'react'

import { StatusWrapper, StatusDirection, NoWrapLabel } from './Status.styles'

type Props = {
  title?: string
  value?: string
  direction?: StatusDirection
  loading?: boolean
  className?: string
}

export const Status: React.FC<Props> = (props): JSX.Element => {
  const { title = '', value = '', direction = 'vertical', loading = false, className = '', ...otherProps } = props

  return (
    <StatusWrapper className={`status-wrapper ${className}`} direction={direction} {...otherProps}>
      {loading ? (
        '...'
      ) : (
        <>
          <NoWrapLabel className="status-title" size="normal">
            {title}
          </NoWrapLabel>
          <NoWrapLabel className="status-value" size="normal">
            {value}
          </NoWrapLabel>
        </>
      )}
    </StatusWrapper>
  )
}

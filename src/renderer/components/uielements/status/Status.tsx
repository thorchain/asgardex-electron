import React from 'react'

import { StatusWrapper, StatusDirection, NoWrapLabel } from './Status.style'

type Props = {
  title?: string
  value?: string
  direction?: StatusDirection
  loading?: boolean
  className?: string
}

const Status: React.FC<Props> = (props: Props): JSX.Element => {
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

export default Status

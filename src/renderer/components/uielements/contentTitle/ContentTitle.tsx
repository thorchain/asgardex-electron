import React from 'react'

import { ContentTitleWrapper } from './ContentTitle.styles'

export type Props = {
  className?: string
  children: React.ReactNode
}

export const ContentTitle: React.FC<Props> = ({ className = '', children, ...otherProps }): JSX.Element => {
  return (
    <ContentTitleWrapper className={`contentTitle-wrapper ${className}`} {...otherProps}>
      {children}
    </ContentTitleWrapper>
  )
}

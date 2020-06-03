import React from 'react'

import { ContentTitleWrapper } from './ContentTitle.style'

type Props = {
  className?: string
  children: React.ReactNode
}

const ContentTitle: React.FC<Props> = ({ className = '', children, ...otherProps }): JSX.Element => {
  return (
    <ContentTitleWrapper className={`contentTitle-wrapper ${className}`} {...otherProps}>
      {children}
    </ContentTitleWrapper>
  )
}

export default ContentTitle

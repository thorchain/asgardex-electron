import React from 'react'

import { ViewWrapper } from './View.style'

type Props = {
  children?: React.ReactNode
}

const View: React.FC<Props> = (props: Props): JSX.Element => {
  const { children } = props
  return <ViewWrapper>{children}</ViewWrapper>
}

export default View

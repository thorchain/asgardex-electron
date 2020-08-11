import React from 'react'

import { useIntl } from 'react-intl'

import * as Styled from './LoadingView.styles'

type LoadingViewProps = {
  text?: string
}

export const LoadingView: React.FC<LoadingViewProps> = (props) => {
  const intl = useIntl()
  return (
    <Styled.Loading title={<Styled.Text>{props.text || intl.formatMessage({ id: 'common.loading' })}</Styled.Text>} />
  )
}

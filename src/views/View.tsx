import React from 'react'
import { HomeViewStyles } from './View.style'
import { Layout } from 'antd'

type Props = {
  children?: React.ReactNode
}

const View: React.FC<Props> = (props: Props): JSX.Element => {
  const { children } = props
  return (
    <Layout.Content>
      <HomeViewStyles>{children}</HomeViewStyles>
    </Layout.Content>
  )
}

export default View

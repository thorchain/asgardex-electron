import React from 'react'
import { Layout, Button } from 'antd'
import { useHistory, useParams } from 'react-router-dom'

type Props = {}

const ContentB: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const { slug } = useParams()

  const clickHandler = () => {
    history.goBack()
  }

  return (
    <Layout.Content>
      <h1>Content B {slug ? ` (${slug})` : ''}</h1>
      <Button onClick={clickHandler}>Back</Button>
    </Layout.Content>
  )
}

export default ContentB

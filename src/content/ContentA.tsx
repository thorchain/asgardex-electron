import React from 'react'
import { Layout, Button } from 'antd'
import { useHistory } from 'react-router-dom'
import { contentBRoute } from '../routes'

type Props = {}

const ContentA: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const clickHandler = () => {
    history.push(contentBRoute.path({ slug: 'anything' }))
  }

  return (
    <Layout.Content>
      <h1>Content A</h1>
      <Button onClick={clickHandler}>Goto content b</Button>
    </Layout.Content>
  )
}

export default ContentA

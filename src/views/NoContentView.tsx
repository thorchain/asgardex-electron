import React, { useCallback } from 'react'

import { Layout, Button } from 'antd'
import { useHistory } from 'react-router-dom'

type Props = {}

const NoContentView: React.FC<Props> = (_): JSX.Element => {
  const history = useHistory()

  const goBack = history.goBack
  const clickHandler = useCallback(() => {
    goBack()
  }, [goBack])
  return (
    <Layout.Content>
      <h1>404</h1>
      <Button onClick={clickHandler}>Back</Button>
    </Layout.Content>
  )
}

export default NoContentView

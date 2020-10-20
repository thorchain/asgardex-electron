import React, { useCallback } from 'react'

import { Button } from 'antd'
import { useHistory } from 'react-router-dom'

export const NoContentView: React.FC = (): JSX.Element => {
  const history = useHistory()

  const goBack = history.goBack
  const clickHandler = useCallback(() => {
    goBack()
  }, [goBack])
  return (
    <>
      <Button onClick={clickHandler}>Back</Button>
      <h1>404</h1>
    </>
  )
}

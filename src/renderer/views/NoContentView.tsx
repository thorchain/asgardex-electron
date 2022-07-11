import React, { useCallback } from 'react'

import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export const NoContentView: React.FC = (): JSX.Element => {
  const navigate = useNavigate()

  const clickHandler = useCallback(() => {
    navigate(-1)
  }, [navigate])

  return (
    <>
      <Button onClick={clickHandler}>Back</Button>
      <h1>404</h1>
    </>
  )
}

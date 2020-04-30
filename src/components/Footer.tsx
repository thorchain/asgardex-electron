import React from 'react'
import { Button, Layout } from 'antd'

type Props = {
  clickButtonHandler?: () => void
}

const Footer: React.FC<Props> = (props): JSX.Element => {
  const { clickButtonHandler } = props

  const clickHandler = () => {
    if (clickButtonHandler) {
      clickButtonHandler()
    }
  }

  return (
    <Layout.Footer>
      <Button type="primary" size="large" onClick={clickHandler}>
        Toggle Space
      </Button>
    </Layout.Footer>
  )
}

export default Footer

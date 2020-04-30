import React from 'react'
import { Button } from 'antd'
import { FooterWrapper } from './Footer.style'

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
    <FooterWrapper>
      Footer
      <Button type="link" size="small" onClick={clickHandler}>
        Toggle padding
      </Button>
    </FooterWrapper>
  )
}

export default Footer

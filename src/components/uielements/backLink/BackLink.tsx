import React from 'react'

import { LeftOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'

import { BackLinkWrapper } from './BackLink.style'

type Props = {
  title?: string
}

const BackLink: React.FC<Props> = ({ title = 'Back' }): JSX.Element => {
  const history = useHistory()

  const clickHandler = () => {
    history.goBack()
  }
  return (
    <BackLinkWrapper onClick={clickHandler}>
      <LeftOutlined />
      <span>{title}</span>
    </BackLinkWrapper>
  )
}

export default BackLink

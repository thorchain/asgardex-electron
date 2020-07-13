import React from 'react'

import { LeftOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'

import { BackLinkWrapper, ButtonText } from './BackLink.style'

type Props = {
  title?: string
  style?: React.CSSProperties
}

const BackLink: React.FC<Props> = ({ title = 'Back', style }): JSX.Element => {
  const history = useHistory()

  const clickHandler = () => {
    history.goBack()
  }
  return (
    <BackLinkWrapper onClick={clickHandler} style={style}>
      <LeftOutlined />
      <ButtonText>{title}</ButtonText>
    </BackLinkWrapper>
  )
}

export default BackLink

import React from 'react'

import { LeftOutlined } from '@ant-design/icons'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { BackLinkWrapper, ButtonText } from './BackLink.style'

type Props = {
  label?: string
  style?: React.CSSProperties
}

const BackLink: React.FC<Props> = ({ label, style }): JSX.Element => {
  const history = useHistory()
  const intl = useIntl()

  const clickHandler = () => {
    history.goBack()
  }
  return (
    <BackLinkWrapper onClick={clickHandler} style={style}>
      <LeftOutlined />
      <ButtonText>{label || intl.formatMessage({ id: 'common.back' })}</ButtonText>
    </BackLinkWrapper>
  )
}

export default BackLink

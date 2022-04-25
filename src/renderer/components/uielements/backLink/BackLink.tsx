import React from 'react'

import { LeftOutlined } from '@ant-design/icons'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { BackLinkWrapper, ButtonText } from './BackLink.styles'

type Props = {
  label?: string
  style?: React.CSSProperties
  path?: string
  className?: string
}

export const BackLink: React.FC<Props> = ({ label, style, path, className }): JSX.Element => {
  const navigate = useNavigate()
  const intl = useIntl()

  const clickHandler = () => {
    if (path) {
      navigate(path)
    } else {
      // go back
      navigate(-1)
    }
  }
  return (
    <BackLinkWrapper onClick={clickHandler} style={style} className={className}>
      <LeftOutlined />
      <ButtonText>{label || intl.formatMessage({ id: 'common.back' })}</ButtonText>
    </BackLinkWrapper>
  )
}

import React from 'react'

import { LeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

import { BackLinkWrapper } from './BackLink.style'

type Props = {
  route: string
  title?: string
}

const BackLink: React.FC<Props> = ({ route, title = 'Back', ...otherProps }): JSX.Element => {
  return (
    <div {...otherProps}>
      <Link to={route}>
        <BackLinkWrapper>
          <LeftOutlined />
          <span>{title}</span>
        </BackLinkWrapper>
      </Link>
    </div>
  )
}

export default BackLink

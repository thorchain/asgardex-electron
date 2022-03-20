import React from 'react'

import { CheckOutlined, CopyOutlined } from '@ant-design/icons'

import * as Styled from './CopyLabel.styles'

type Props = {
  label: string
  textToCopy: string
  className?: string
}

export const CopyLabel: React.FC<Props> = ({ label, textToCopy, className }): JSX.Element => {
  return (
    <Styled.CopyLabel
      className={className}
      copyable={{
        text: textToCopy,
        icon: [
          <div key={1}>
            {label}
            <CopyOutlined />
          </div>,
          <div key={2}>
            {label}
            <CheckOutlined />
          </div>
        ]
      }}
    />
  )
}

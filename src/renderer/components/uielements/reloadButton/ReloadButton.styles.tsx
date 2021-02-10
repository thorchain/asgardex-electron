import React from 'react'

import { SyncOutlined } from '@ant-design/icons'
import styled from 'styled-components'

import { Button as UIButton, ButtonProps as UIButtonProps } from '../../uielements/button'

export const ReloadButton = styled(UIButton).attrs<UIButtonProps>(({ children }) => ({
  typevalue: 'outline',
  children: (
    <>
      <SyncOutlined />
      {children && <span>{children}</span>}
    </>
  )
}))`
  &.ant-btn {
    /* overridden */
    min-width: auto;
    padding: 4px 8px;
  }
  height: 30px;
  margin-right: 10px;
`

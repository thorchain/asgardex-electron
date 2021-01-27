import React from 'react'

import { SyncOutlined } from '@ant-design/icons'
import styled from 'styled-components'

import { Button as UIButton } from '../../uielements/button'

export const ReloadButton = styled(UIButton).attrs((props) => ({
  typevalue: 'outline',
  children: (
    <>
      <SyncOutlined />
      {props.children && <span>{props.children}</span>}
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

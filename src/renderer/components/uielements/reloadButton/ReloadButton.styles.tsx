import React from 'react'

import { SyncOutlined } from '@ant-design/icons'
import styled from 'styled-components'

import { Button as UIButton } from '../../uielements/button'

export const ReloadButton = styled(UIButton).attrs({
  typevalue: 'outline',
  children: <SyncOutlined />
})`
  &.ant-btn {
    /* overridden */
    min-width: auto;
  }
  width: 30px;
  height: 30px;
  margin-right: 10px;
`

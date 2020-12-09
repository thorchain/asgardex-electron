import React from 'react'

import { SyncOutlined } from '@ant-design/icons'
import styled from 'styled-components'

import { Button as UIButton } from '../button'

export const ReloadFeeButton = styled(UIButton).attrs({
  typevalue: 'outline',
  children: <SyncOutlined />
})`
  &.ant-btn {
    /* overridden */
    min-width: auto;
    margin-right: 10px;
  }
  width: 30px;
  height: 30px;
  margin-right: 10px;
`
export const Container = styled('div')`
  display: flex;
  align-items: center;
`

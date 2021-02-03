import React from 'react'

import { SyncOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Button as UIButton } from '../button'
import { Label as UILabel } from '../label'

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
  color: ${palette('text', 0)};
`

export const FeeLabel = styled(UILabel)<{ isError?: boolean; isLoading?: boolean }>`
  color: ${({ isError, isLoading }) =>
    isError ? palette('error', 0) : isLoading ? palette('gray', 2) : palette('text', 0)};
`

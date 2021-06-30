import React from 'react'

import { SyncOutlined } from '@ant-design/icons'
import styled from 'styled-components'

import { Button as UIButton, ButtonProps as UIButtonProps } from '../../uielements/button'

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ChildrenWrapper = styled.span`
  padding-left: 10px;
`
export const ReloadButton = styled(UIButton).attrs<UIButtonProps>(({ children }) => ({
  typevalue: 'outline',
  children: (
    <ContentWrapper>
      <SyncOutlined />
      {children && <ChildrenWrapper>{children}</ChildrenWrapper>}
    </ContentWrapper>
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

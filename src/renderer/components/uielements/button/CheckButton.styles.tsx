import * as AIcon from '@ant-design/icons'
import * as A from 'antd'
import styled from 'styled-components'

import { Button as ButtonUI } from './Button'

export const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const CheckCircleOutlined = styled(AIcon.CheckCircleOutlined)<{ checked: boolean }>`
  padding-right: 5px;
  // Add some transparency if checked
  opacity: ${(props) => (props.checked ? '1' : '0.7')};

  // hide arrow if not checked
  svg path:nth-child(1) {
    opacity: ${(props) => (props.checked ? '1' : '0')};
  }
`

type ButtonProps = { checked: boolean } & A.ButtonProps

export const Button = styled(ButtonUI).attrs({
  typevalue: 'transparent',
  type: 'text'
})<ButtonProps>`
  box-shadow: none;
  padding: 0px;
  min-width: auto !important;
  margin-right: 5px;
`

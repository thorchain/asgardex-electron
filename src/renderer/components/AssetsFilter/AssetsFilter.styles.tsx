import * as AI from '@ant-design/icons'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Button as ButtonUI, ButtonProps } from '../uielements/button'

const filterButtonBorderRadius = 15
export const FilterButton = styled(ButtonUI)<ButtonProps & { active: 'true' | 'false' }>`
  margin-right: 10px;
  &:last-child {
    margin: 0;
  }

  &.ant-btn {
    padding: 0 12px;
    min-width: 0;
    border-radius: ${filterButtonBorderRadius}px;
    border: solid 1px ${palette('gray', 1)} !important;
    background: ${({ active }) => (active === 'true' ? palette('background', 0) : palette('gray', 0))} !important;
    color: ${({ active }) => (active === 'true' ? palette('text', 1) : palette('text', 2))};
    border: none;

    &.focused,
    &:hover,
    &:active,
    &:focus {
      border-color: ${palette('gray', 1)} !important;
      color: ${palette('text', 1)} !important;
    }
    &:hover {
      background: ${palette('background', 0)} !important;
    }
  }
`

export const Star = styled(AI.StarFilled)`
  svg {
    fill: ${palette('grey', 0)};
    width: 15px;
    height: 15px;
  }
`

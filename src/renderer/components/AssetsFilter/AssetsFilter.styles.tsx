import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Button as ButtonUI, ButtonProps } from '../uielements/button'

export const Container = styled.div`
  display: flex;
`

const filterButtonBorderRadius = 15
export const FilterButton = styled(ButtonUI)<ButtonProps & { active?: 'true' | 'false' }>`
  margin-right: 10px;
  &:last-child {
    margin: 0;
  }

  &.ant-btn {
    padding: 0 12px;
    min-width: 0;
    border-radius: ${filterButtonBorderRadius}px;
    border: solid 1px ${palette('gray', 1)} !important;
    background: ${palette('gray', 0)};
    color: ${({ active }) => (active === 'true' ? palette('text', 1) : palette('text', 2))};
    border: none;

    // use :before element instead of :after as :after is used by ant to make some transition effects
    &:before {
      content: ' ';
      display: block;
      position: absolute;
      width: calc(100% - ${filterButtonBorderRadius}px);
      height: 2px;
      background: ${palette('primary', 0)};
      bottom: -5px;
      top: auto;
      left: auto;
      right: auto;
      opacity: 0;
    }

    ${({ active }) =>
      active === 'true' &&
      `
       &:before {
        opacity: 1;
       }
    `}

    &.focused,
    &:hover,
    &:active,
    &:focus {
      border-color: ${palette('gray', 1)} !important;
      background: ${palette('background', 0)} !important;
      color: ${palette('text', 1)} !important;
    }
  }
`
export const ResetButton = styled(ButtonUI).attrs({ typevalue: 'transparent' })`
  &.ant-btn {
    padding: 0;
    min-width: 0;
    transform: rotateZ(90deg);
    color: ${palette('gray', 1)} !important;

    &.focused,
    &:hover,
    &:active,
    &:focus {
      color: ${palette('error', 0)} !important;
    }
  }
`

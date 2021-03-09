import styled from 'styled-components'
import { palette } from 'styled-theme'

import { Button as ButtonUI, ButtonProps } from '../uielements/button'

export const Container = styled.div`
  display: flex;
`

export const FilterButton = styled(ButtonUI)<ButtonProps & { active?: 'true' | 'false' }>`
  margin-right: 10px;
  &:last-child {
    margin: 0;
  }

  &.ant-btn {
    padding: 0 12px;
    min-width: 0;
    border-radius: 15px;
    background: ${palette('gray', 1)};
    color: ${({ active }) => (active === 'true' ? palette('text', 0) : palette('text', 2))};
    border: none;

    &.focused,
    &:hover,
    &:active,
    &:focus {
      background: ${palette('gray', 1)} !important;
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

import * as AI from '@ant-design/icons'
import styled from 'styled-components'
import { palette } from 'styled-theme'

import { media } from '../../helpers/styleHelper'
import { Button as ButtonUI, ButtonProps } from '../uielements/button'
import { Input as InputUI } from '../uielements/input'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;

  ${media.md`
  justify-content: left;
  flex-direction: row;
`}
`

export const Input = styled(InputUI)`
  width: 200px;

  margin: 10px 0 0 0;

  border-color: ${palette('gray', 1)};

  .ant-input-prefix svg,
  .anticon-close-circle svg {
    color: ${palette('gray', 1)};
  }

  ${media.md`
  margin: 0 10px 0 10px;
  `}
`

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

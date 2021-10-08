import { CaretDownOutlined } from '@ant-design/icons'
import styled, { css } from 'styled-components'
import { palette } from 'styled-theme'

import { transition } from '../../../../settings/style-util'

export const AssetSelectWrapper = styled.button`
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  padding: 5px 10px;
  border: 0;
  background-color: ${palette('background', 0)};
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  &:focus {
    outline: none;
  }

  ${transition(0.5)};

  ${({ disabled }) =>
    !disabled
      ? css`
          &:hover,
          &.selected {
            box-shadow: 0 0px 15px ${palette('gray', 1)};
          }
        `
      : ''};
`

export const AssetSelectMenuWrapper = styled.div<{ minWidth?: number }>`
  margin-top: 15px;
  min-width: ${({ minWidth }) => minWidth || 216}px;
`

export const DropdownIcon = styled(CaretDownOutlined)`
  transition: transform 0.2s ease-in-out;
  transform: ${({ open }) => (open ? 'rotate(180deg)' : 'rotate(0)')};

  svg {
    font-size: 22px;
    color: ${palette('primary', 0)};
    opacity: ${({ disabled = false }) => (disabled ? 0.5 : 1)};
  }
`

export const DropdownIconHolder = styled.div`
  padding-top: 5px;
`

export const AssetDropdownButton = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0;
  &:focus {
    outline: none;
  }
`
